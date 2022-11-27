# Esdeka

Communicate between `<iframe>` and host

<p align="center">
  <img src="https://raw.githubusercontent.com/pixelass/esdeka/main/resources/esdeka-logo.svg" alt="" width="256"/>
</p>

[![Codacy coverage](https://img.shields.io/codacy/coverage/e6bcc5f792d54ed0902f9116e9435da3?logo=jest&style=for-the-badge)](https://app.codacy.com/gh/pixelass/esdeka/dashboard?branch=main)
[![Codacy grade](https://img.shields.io/codacy/grade/e6bcc5f792d54ed0902f9116e9435da3?logo=codacy&style=for-the-badge)](https://app.codacy.com/gh/pixelass/esdeka/dashboard?branch=main)
[![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/pixelass/esdeka?color=%23471694&logo=snyk&style=for-the-badge)](https://snyk.io/advisor/npm-package/esdeka)

[![npm](https://img.shields.io/npm/v/esdeka?color=%23cb3837&logo=npm&style=for-the-badge)](https://www.npmjs.com/package/esdeka)
[![npm downloads weekly](https://img.shields.io/npm/dw/esdeka?color=%23cb3837&logo=npm&style=for-the-badge)](https://www.npmjs.com/package/esdeka)

[![License MIT](https://img.shields.io/github/license/pixelass/esdeka?style=for-the-badge)](https://github.com/pixelass/esdeka/blob/main/LICENSE)
![node-current](https://img.shields.io/node/v/esdeka?color=%23026e00&style=for-the-badge)

[![GitHub Sponsors](https://img.shields.io/github/sponsors/pixelass?color=%23db61a2&logo=github&style=for-the-badge)](https://github.com/sponsors/pixelass)

## Table of Contents

<!-- toc -->

- [Mechanism](#mechanism)
  - [Creating a connection](#creating-a-connection)
- [Functions](#functions)
  - [`call`](#call)
  - [`answer`](#answer)
  - [`disconnect`](#disconnect)
  - [`subscribe`](#subscribe)
  - [`dispatch`](#dispatch)
  - [`broadcast`](#broadcast)
- [React hooks](#react-hooks)
  - [`useHost`](#usehost)
  - [`useGuest`](#useguest)
- [Bundle size](#bundle-size)
- [Full React example (using Zustand)](#full-react-example-using-zustand)

<!-- tocstop -->

## Mechanism

Esdeka uses
[`window.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to
communicate to iframes. It offers several helpers to make communication as easy as possible.

We stream data down to the iframe. If the iframe wants to communicate back it dispatches an action
with an optional payload. We can then decide how to act on the transmitted data.

<img src="https://raw.githubusercontent.com/pixelass/esdeka/main/resources/esdeka-flow.svg" alt=""/>
<small>Flux flow</small>

### Creating a connection

To create a connection we need to call a client and wait for an answer.

Setting up a **Host**.

```ts
import { call } from "esdeka";

const iframe = document.querySelector("iframe");

call(iframe.contentWindow, "my-channel", { some: "Data" });
```

Setting up a **Guest**.

```ts
import { answer, subscribe } from "esdeka";

subscribe("my-channel", event => {
  if (event.data.action.type === "call") {
    answer(event.source, "my-channel");
  }
});
```

Once a connection exists, we can broadcast information from the host to the guest.

**Host**

```ts
import { broadcast, call, subscribe } from "esdeka";

const iframe = document.querySelector("iframe");

call(iframe.contentWindow, "my-channel", { some: "Data" });

subscribe("my-channel", event => {
  if (event.data.action.type === "answer") {
    broadcast(event.source, "my-channel", {
      question: "How are you?",
    });
  }
});
```

The guest subscribes to all messages and act accordingly.

**Guest**

```ts
import { answer, subscribe } from "esdeka";

const questions = [];

subscribe("my-channel", event => {
  const { type, payload } = event.data.action;
  switch (type) {
    case "broadcast":
      if (payload?.question) {
        questions.push(payload.question);
      }
      break;
    case "call":
      answer(event.source, "my-channel");
      break;
    default:
      console.error("Not implemented");
      break;
  }
});
```

## Functions

### `call`

Sends a connection request from the host to a guest. The payload can be anything that you want to
send through a channel.

| Argument        | Type      | Description                                                                                                                                                                 |
| --------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`        | `Window`  | Has to be a [`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) to use [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) |
| `channel`       | `string`  | The channel on which the host and gues communicate. The host and guest have to use the same channel to communicate.                                                         |
| `payload`       | `unknown` | The payload that of the message can contain any data. We cannot transmit functions or circular objects, therefore we recommend using a serializer.                          |
| `targetOrigin?` | `string`  | Optional origin to prevent insecure communication.                                                                                                                          |

```ts
call(window, "my-channel", {
  message: "Hello",
});
```

### `answer`

Answer to a host to confirm the connection.

| Argument        | Type     | Description                                                                                                                                                                 |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`        | `Window` | Has to be a [`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) to use [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) |
| `channel`       | `string` | The channel on which the host and gues communicate. The host and guest have to use the same channel to communicate.                                                         |
| `targetOrigin?` | `string` | Optional origin to prevent insecure communication.                                                                                                                          |

```ts
answer(window, "my-channel");
```

### `disconnect`

Tell the host that the guest disconnected.

| Argument        | Type     | Description                                                                                                                                                                 |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`        | `Window` | Has to be a [`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) to use [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) |
| `channel`       | `string` | The channel on which the host and gues communicate. The host and guest have to use the same channel to communicate.                                                         |
| `targetOrigin?` | `string` | Optional origin to prevent insecure communication.                                                                                                                          |

```ts
disconnect(window, "my-channel");
```

### `subscribe`

Listen to all messages in a channel.

| Argument        | Type                            | Description                                                                                                                                                                 |
| --------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`        | `Window`                        | Has to be a [`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) to use [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) |
| `channel`       | `string`                        | The channel on which the host and gues communicate. The host and guest have to use the same channel to communicate.                                                         |
| `callback`      | `(event: MessageEvent) => void` | The callback function of the subscription                                                                                                                                   |
| `targetOrigin?` | `string`                        | Optional origin to prevent insecure communication.                                                                                                                          |

```ts
subscribe("my-channel", event => {
  console.log(event);
});
```

### `dispatch`

Send an action to Esdeka. The host will be informed and can act un the request.

| Argument        | Type              | Description                                                                                                                                                                 |
| --------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`        | `Window`          | Has to be a [`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) to use [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) |
| `channel`       | `string`          | The channel on which the host and gues communicate. The host and guest have to use the same channel to communicate.                                                         |
| `action`        | `Action<unknown>` | The action that is dispatched by the guest.                                                                                                                                 |
| `targetOrigin?` | `string`          | Optional origin to prevent insecure communication.                                                                                                                          |

**Without payload**

```ts
dispatch(window, "my-channel", {
  type: "increment",
});
```

**With payload**

```ts
dispatch(window, "my-channel", {
  type: "greet",
  payload: {
    message: "Hello",
  },
});
```

### `broadcast`

Send data from the host window to the guest. The payload can be anything that you want to send
through a channel.

| Argument        | Type      | Description                                                                                                                                                                 |
| --------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`        | `Window`  | Has to be a [`Window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) to use [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) |
| `channel`       | `string`  | The channel on which the host and gues communicate. The host and guest have to use the same channel to communicate.                                                         |
| `payload`       | `unknown` | The payload that of the message can contain any data. We cannot transmit functions or circular objects, therefore we recommend using a serializer.                          |
| `targetOrigin?` | `string`  | Optional origin to prevent insecure communication.                                                                                                                          |

```ts
broadcast(window, "my-channel", {
  message: "Hello",
});
```

## React hooks

### `useHost`

Curried host functions that don't need the window and channel.

```tsx
const { broadcast, call, subscribe } = useHost(ref, "my-channel");

call({
  message: "Hello",
});

broadcast({
  message: "Hello",
});

subscribe(event => {
  console.log(event);
});
```

### `useGuest`

Curried guest functions that don't need the window and channel.

```tsx
const { answer, disconnect, dispatch, subscribe } = useGuest(ref, "my-channel");

answer();

disconnect();

subscribe(event => {
  console.log(event);
});

dispatch({
  type: "greet",
  payload: {
    message: "Hello",
  },
});
```

## Bundle size

All bundles are smaller than 1KB

<!-- bundle -->

```shell

 PASS  ./dist/index.js: 554B < maxSize 1KB (gzip)

 PASS  ./dist/index.mjs: 511B < maxSize 1KB (gzip)

 PASS  ./dist/react.js: 696B < maxSize 1KB (gzip)

 PASS  ./dist/react.mjs: 673B < maxSize 1KB (gzip)

```

<!-- bundlestop -->

## Full React example (using Zustand)

**Host**

`http://localhost:3000/`

```tsx
import { serialize, useHost } from "esdeka/react";
import { DetailedHTMLProps, IframeHTMLAttributes, useEffect, useRef, useState } from "react";
import create from "zustand";

export interface StoreModel {
  counter: number;
  increment(): void;
  decrement(): void;
}

export const useStore = create<StoreModel>(set => ({
  counter: 0,
  increment() {
    set(state => ({ counter: state.counter + 1 }));
  },
  decrement() {
    set(state => ({ counter: state.counter - 1 }));
  },
}));

export interface EsdekaHostProps
  extends DetailedHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement> {
  channel: string;
  maxTries?: number;
  interval?: number;
}

export function EsdekaHost({ channel, maxTries = 30, interval = 30, ...props }: EsdekaHostProps) {
  const ref = useRef<HTMLIFrameElement>(null);
  const connection = useRef(false);
  const [tries, setTries] = useState(maxTries);

  const { broadcast, call, subscribe } = useHost(ref, channel);

  // Send a connection request
  useEffect(() => {
    if (connection.current || tries <= 0) {
      return () => {
        /* Consistency */
      };
    }

    call(serialize(useStore.getState()));
    const timeout = setTimeout(() => {
      call(serialize(useStore.getState()));
      setTries(tries - 1);
    }, interval);

    return () => {
      clearTimeout(timeout);
    };
  }, [call, tries, interval]);

  useEffect(() => {
    if (!connection.current) {
      const unsubscribe = subscribe(event => {
        const store = useStore.getState();
        const { action } = event.data;
        switch (action.type) {
          case "answer":
            connection.current = true;
            break;
          default:
            if (typeof store[action.type] === "function") {
              store[action.type](action.payload.store);
            }
            break;
        }
      });
      return () => {
        unsubscribe();
      };
    }
    return () => {
      /* Consistency */
    };
  }, [subscribe]);

  // Broadcast store to guest
  useEffect(() => {
    if (connection.current) {
      const unsubscribe = useStore.subscribe(newState => {
        broadcast(serialize(newState));
      });
      return () => {
        unsubscribe();
      };
    }
    return () => {
      /* Consistency */
    };
  }, [broadcast]);

  return <iframe ref={ref} {...props} />;
}

export default function App() {
  const increment = useStore(state => state.increment);
  const decrement = useStore(state => state.decrement);
  const counter = useStore(state => state.counter);
  return (
    <div>
      <button onClick={increment}>Up</button>
      <span>{counter}</span>
      <button onClick={decrement}>Down</button>
      <EsdekaHost channel="esdeka-test" src="http://localhost:3001" />
    </div>
  );
}
```

**Guest**

`http://localhost:3001`

```tsx
import { useGuest } from "esdeka/react";
import { useEffect, useState } from "react";
import create from "zustand";

export interface StoreModel {
  [key: string]: any;
  // eslint-disable-next-line no-unused-vars
  set(state: Omit<StoreModel, "set">): void;
}

export const useStore = create<StoreModel>(set => ({
  set(state) {
    set(state);
  },
}));

export function EsdekaGuest({ channel }: { channel: string }) {
  const counter = useStore(state => state.counter);
  const host = useRef<Window | null>(null);
  const { answer, dispatch, subscribe } = useGuest();

  useEffect(() => {
    const unsubscribe = subscribe<Except<StoreModel, "set">>(event => {
      const { action } = event.data;
      switch (action.type) {
        case "call":
          host.current = event.source as Window;
          answer();
          break;
        case "broadcast":
          useStore.getState().set(action.payload);
          break;
        default:
          break;
      }
    });
    return () => {
      unsubscribe();
    };
  }, [answer, subscribe]);

  return (
    <div>
      <h1>Current Count: {counter}</h1>
      <button
        onClick={() => {
          dispatch({ type: "decrement" });
        }}
      >
        Down
      </button>
      <button
        onClick={() => {
          dispatch({ type: "increment" });
        }}
      >
        Up
      </button>
    </div>
  );
}

export default function Page() {
  return <EsdekaGuest channel="esdeka-test" />;
}
```
