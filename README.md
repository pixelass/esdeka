# EsDeKa

Communicate between `<iframe>` and host

<p align="center">
  <img src="https://github.com/pixelass/esdeka/blob/main/resources/logo.svg" alt="" width="200"/>
</p>

<!--
![Codacy coverage](https://img.shields.io/codacy/coverage/a22d58431d614c798ac08fd5414b419e?style=for-the-badge)
![Codacy grade](https://img.shields.io/codacy/grade/a22d58431d614c798ac08fd5414b419e?style=for-the-badge)
-->

## Table of Contents

<!-- toc -->

- [Purpose](#purpose)
- [Built on Zustand](#built-on-zustand)
- [Usage](#usage)
  - [Host](#host)
  - [Iframe](#iframe)
- [Typescript](#typescript)

<!-- tocstop -->

## Purpose

While developing an internal tool we wanted to communicate to third party apps/widgets that are
hosted in an iframe.

In our case we wanted to pass a state, theme and additional data down to the iframe.

## Built on Zustand

We decided to use [Zustand](https://github.com/pmndrs/zustand) as a state management library,
because it allows several mechanisms, that are required to make this possible. React does not allow
using hooks passed though an iframe to be run in the iframe, therefore we create a custom hook in
the iframe that subscribes to Zustand.

## Usage

The usage is pretty straight forward, especially if you don't use typescript.

### Host

```jsx
import { FrameWidget } from "esdeka";

const myWidget = {
  id: "my_widget",
  name: "This is my Widget ",
  widget: {
    __typename: "Frame",
    data: {
      src: "https://example.com/widgets/my-widget",
    },
  },
};

export default function App() {
  return <FrameWidget sdkKey="MY_SDK" data={myWidget} />;
}
```

### Iframe

```jsx
import { SdkProvider, useSdk, useSdkStore } from "esdeka";

function InnerComponent() {
  const widgets = useSdkStore(state => state.data);
  const setWidgetData = useSdkStore(state => state.setWidgetData);
  const backgroundColor = useSdk(sdk => sdk.data.bgcolor);
  const theme = useSdk(sdk => sdk.theme);

  return (
    <div
      style={theme => ({
        position: "absolute",
        inset: 0,
        backgroundColor,
      })}
    >
      <button
        onClick={() => {
          setWidgetData(widget => {
            widget.message = "Hello, I am a widget";
          });
        }}
      >
        Set widget data
      </button>
      <pre>{JSON.stringify(widgets, null, 2)}</pre>
    </div>
  );
}

export default function App() {
  return (
    <SdkProvider sdkKey="MY_SDK">
      <InnerComponent />
    </SdkProvider>
  );
}
```

## Typescript

We added an example in [examples/example.tsx](./examples/example.tsx). It shows how to add data to
the store and add a custom theme. Please look at the comments to understand how to add the correct
typings to your sdk. The example is a fully working sdk intended to be shared over a
package-manager. The `useStore` would usually not be shared in said package. It is intended to be
used in the host only. Only the store model (here `CounterStore`) is needed.
