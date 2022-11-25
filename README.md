# Esdeka

Communicate between `<iframe>` and host

<p align="center">
  <img src="https://raw.githubusercontent.com/pixelass/esdeka/main/resources/esdeka-logo.png" alt="" width="256"/>
</p>

## Table of Contents

<!-- toc -->

- [Purpose](#purpose)
- [Functions](#functions)
  - [Connect](#connect)
  - [Connected](#connected)
  - [Disconnect](#disconnect)
  - [Subscribe](#subscribe)
  - [Dispatch](#dispatch)
  - [Broadcast](#broadcast)
- [React hooks](#react-hooks)
  - [useHost](#usehost)
  - [useGuest](#useguest)
- [Bundle size](#bundle-size)
- [Examples](#examples)
  - [Vanilla](#vanilla)
    - [Host](#host)
    - [Guest](#guest)
  - [React (using Zustand)](#react-using-zustand)
    - [Host](#host-1)
    - [Guest](#guest-1)

<!-- tocstop -->

## Purpose

While building a dashboard we wanted to allow an easy way to communicate state changes and other
data between the host and guest frame.

<img src="https://raw.githubusercontent.com/pixelass/esdeka/main/resources/esdeka-flow.svg" alt=""/>

## Functions

### Connect

Sends a connection request from the host to a guest. The payload can be anything that you want to
send through a channel.

```ts
connect(window, "my-channel", {
  message: "Hello",
});
```

### Connected

Answer to a host to confirm the connection.

```ts
connected(window, "my-channel");
```

### Disconnect

Tell the host that the guest disconnected.

```ts
disconnect(window, "my-channel");
```

### Subscribe

Listen to all messages in a channel.

```ts
subscribe("my-channel", event => {
  console.log(event);
});
```

### Dispatch

Send an action to Esdeka. The host will be informed and can act un the request.

**Without payload**

```ts
dispatch(window, "my-channel", {
  action: {
    type: "increment",
  },
});
```

**With payload**

```ts
dispatch(window, "my-channel", {
  action: {
    type: "greet",
    payload: {
      message: "Hello",
    },
  },
});
```

### Broadcast

Send data from the host window to the guest. The payload can be anything that you want to send
through a channel.

```ts
boadcast(window, "my-channel", {
  message: "Hello",
});
```

## React hooks

### useHost

Provides curried host functions that don't need the window and channel.

```tsx
const { broadcast, connect, subscribe } = useHost(ref, "my-channel");

connect({
  message: "Hello",
});

boadcast({
  message: "Hello",
});

subscribe(event => {
  console.log(event);
});
```

### useGuest

```tsx
const { connected, disconnect, dispatch, subscribe } = useGuest(ref, "my-channel");

connected();

disconnect();

subscribe(event => {
  console.log(event);
});

dispatch({
  action: {
    type: "greet",
    payload: {
      message: "Hello",
    },
  },
});
```

## Bundle size

All bundles are smaller than 1KB

```shell

 PASS  ./dist/index.js: 551B < maxSize 1KB (gzip)

 PASS  ./dist/index.mjs: 509B < maxSize 1KB (gzip)

 PASS  ./dist/react.js: 695B < maxSize 1KB (gzip)

 PASS  ./dist/react.mjs: 670B < maxSize 1KB (gzip)

```

## Examples

### Vanilla

#### Host

```ts
import { connect } from "esdeka";

const iframe = document.querySelector("iframe");

connect(iframe.contentWindow, "my-channel", { some: "Data" });
```

#### Guest

```ts
import { connect } from "esdeka";

subscribe("my-channel", event => {
  if (event.data.action.type === "connect") {
    connected(event.source, "my-channel");
  }
});
```

### React (using Zustand)

#### Host

`http://localhost:3000/`

```tsx
import { serialize } from "esdeka";
import { useHost } from "esdeka/react";
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

  const { broadcast, connect, subscribe } = useHost(ref, channel);

  // Send a connection request
  useEffect(() => {
    if (connection.current || tries <= 0) {
      return () => {
        /* Consistency */
      };
    }

    connect(serialize(useStore.getState()));
    const timeout = setTimeout(() => {
      connect(serialize(useStore.getState()));
      setTries(tries - 1);
    }, interval);

    return () => {
      clearTimeout(timeout);
    };
  }, [connect, tries, interval]);

  useEffect(() => {
    if (!connection.current) {
      const unsubscribe = subscribe(event => {
        const store = useStore.getState();
        const { action } = event.data;
        switch (action.type) {
          case "connected":
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

#### Guest

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
  const { connected, dispatch, subscribe } = useGuest();

  useEffect(() => {
    const unsubscribe = subscribe<Except<StoreModel, "set">>(event => {
      const { action } = event.data;
      switch (action.type) {
        case "connect":
          host.current = event.source as Window;
          connected(host.current);
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
  }, [connected, subscribe]);

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
