# Esdeka

Communicate between `<iframe>` and host

<p align="center">
  <img src="https://raw.githubusercontent.com/pixelass/esdeka/main/resources/logo.svg" alt="" width="200"/>
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
- [Examples](#examples)
  - [Vanilla](#vanilla)
    - [Host](#host)
    - [Guest](#guest)
  - [React (using Zustand)](#react-using-zustand)
    - [Host:](#host)
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

Send an action to Esdeka. THe host will be informed and can act un the request.

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

const iframe = document.querySelector("iframe");

subscribe("my-channel", event => {
  if (event.data.action.type === "connect") {
    connected(event.source, "my-channel");
  }
});
```

### React (using Zustand)

#### Host:

```tsx
import { DetailedHTMLProps, IframeHTMLAttributes, useEffect, useRef, useState } from "react";
import create from "zustand";

import { broadcast, connect, serialize, subscribe } from "esdeka";

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

  // Send a connection request
  useEffect(() => {
    console.log("connecting", tries, connection.current);
    if (connection.current || tries <= 0) {
      return () => {
        /* Consistency */
      };
    }

    connect(ref.current.contentWindow, channel, serialize(useStore.getState()));
    const timeout = setTimeout(() => {
      connect(ref.current.contentWindow, channel, serialize(useStore.getState()));
      setTries(tries - 1);
    }, interval);

    return () => {
      clearTimeout(timeout);
    };
  }, [channel, tries, interval]);

  useEffect(() => {
    if (!connection.current) {
      const unsubscribe = subscribe(channel, event => {
        const store = useStore.getState();
        const { action } = event.data;
        switch (action.type) {
          case "connected":
            connection.current = true;
            break;
          default:
            if (typeof store[action.type] === "function") {
              store[action.type](action.payload);
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
  }, [channel]);

  // Broadcast store to guest
  useEffect(() => {
    if (!connection.current) {
      const unsubscribe = useStore.subscribe(newState => {
        broadcast(ref.current.contentWindow, channel, serialize(newState));
      });
      return () => {
        unsubscribe();
      };
    }
    return () => {
      /* Consistency */
    };
  }, []);

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
      <EsdekaHost channel="esdeka-test" src="http://localhost:3000/widgets/esdeka2" />
    </div>
  );
}
```

#### Guest

```tsx
import { connected, dispatch, subscribe } from "esdeka";
import { useEffect, useState } from "react";
import { Except } from "type-fest";
import create from "zustand";

export interface StoreModel {
  [key: string]: any;
  // eslint-disable-next-line no-unused-vars
  set(state: Except<StoreModel, "set">): void;
}

export const useStore = create<StoreModel>(set => ({
  set(state) {
    set(state);
  },
}));

export function EsdekaGuest({ channel }: { channel: string }) {
  const counter = useStore(state => state.counter);
  const [host, setHost] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribe<Except<StoreModel, "set">>(channel, event => {
      const { origin, source } = event;
      const { action } = event.data;
      switch (action.type) {
        case "connect":
          setHost({ origin, source });
          connected(source as Window, channel);
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
  }, [channel]);

  return (
    <div>
      <div>{counter}</div>
      <button
        onClick={() => {
          dispatch(host.source, channel, { type: "decrement" });
        }}
      >
        Down
      </button>
      <button
        onClick={() => {
          dispatch(host.source, channel, { type: "increment" });
        }}
      >
        Up
      </button>
      <h1>Hello</h1>
    </div>
  );
}

export default function Page() {
  return <EsdekaGuest channel="esdeka-test" />;
}
```
