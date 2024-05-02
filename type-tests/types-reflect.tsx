/* eslint-disable @typescript-eslint/ban-ts-comment */
import { reflect } from '@effector/reflect';
import { createEvent, createStore } from 'effector';
import React, {
  type ComponentType,
  createRef,
  type EventHandler,
  type FC,
  type ForwardedRef,
  forwardRef,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
  useRef,
} from 'react';
import { expectType } from 'tsd';

// basic reflect
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
      color: 'red',
    },
  });

  expectType<FC>(ReflectedInput);
}

// reflect allows to infer handlers for event.prepend
{
  const Input: FC<{
    value: string;
    onChange: (event: { target: { value: string } }) => void;
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      // here typescript should infer types correctly
      onChange: changed.prepend((e) => {
        expectType<string>(e.target.value);
        return e.target.value;
      }),
    },
  });

  expectType<FC>(ReflectedInput);
}

// reflect should not allow wrong props
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
      // @ts-expect-error
      color: 'blue',
    },
  });

  expectType<FC>(ReflectedInput);
}

// reflect should not allow wrong props in final types
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
    },
  });

  const App: FC = () => {
    return (
      <ReflectedInput
        // @ts-expect-error
        color="blue"
      />
    );
  };
  expectType<FC>(App);
}

// reflect should allow not-to pass required props - as they can be added later in react
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
    },
  });

  const App: FC = () => {
    // missing prop must still be required in react
    // @ts-expect-error
    return <ReflectedInput />;
  };

  const AppFixed: FC = () => {
    return <ReflectedInput color="red" />;
  };
  expectType<FC>(App);
  expectType<FC>(AppFixed);
}

// reflect should make "binded" props optional - so it is allowed to overwrite them in react anyway
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
    },
  });

  const App: FC = () => {
    return <ReflectedInput value="kek" color="red" />;
  };

  const AppFixed: FC = () => {
    return <ReflectedInput color="red" />;
  };
  expectType<FC>(App);
  expectType<FC>(AppFixed);
}

// reflect should not allow to override "binded" props with wrong types
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
    color: 'red';
  }> = () => null;
  const $value = createStore<string>('');
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: $value,
      onChange: changed,
      color: 'red',
    },
  });

  const App: FC = () => {
    return (
      <ReflectedInput
        // @ts-expect-error
        color="blue"
      />
    );
  };
  expectType<FC>(App);
}

// reflect should allow to pass EventCallable<void> as click event handler
{
  const Button: FC<{
    onClick: EventHandler<MouseEvent<HTMLButtonElement>>;
  }> = () => null;

  const reactOnClick = createEvent();

  const ReflectedButton = reflect({
    view: Button,
    bind: {
      onClick: reactOnClick,
    },
  });

  expectType<FC>(ReflectedButton);
}

// reflect should not allow binding ref
{
  const Text = forwardRef(
    (_: { value: string }, ref: ForwardedRef<HTMLSpanElement>) => null,
  );

  const ReflectedText = reflect({
    view: Text,
    bind: {
      // @ts-expect-error
      ref: createRef<HTMLSpanElement>(),
    },
  });

  expectType<FC>(ReflectedText);
}

// reflect should pass ref through
{
  const $value = createStore<string>('');
  const Text = forwardRef(
    (_: { value: string }, ref: ForwardedRef<HTMLSpanElement>) => null,
  );

  const ReflectedText = reflect({
    view: Text,
    bind: { value: $value },
  });

  const App: FC = () => {
    const ref = useRef(null);

    return <ReflectedText ref={ref} />;
  };

  expectType<FC>(App);
}

// reflect should allow to pass any callback
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: (e) => {
        expectType<string>(e);
        changed(e);
      },
    },
  });

  expectType<FC>(ReflectedInput);
}

// should allow store with a function as a callback value
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const $changed = createStore<(newValue: string) => void>(() => {});

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: $changed,
    },
  });

  expectType<FC>(ReflectedInput);
}

function localize<T extends 'b'>(value: T): { lol: boolean };
function localize<T extends 'a'>(value: T): { kek: boolean };
function localize(value: string): unknown {
  return value;
}

// should allow store with generics
{
  const Input: FC<{
    value: string;
    onChange: typeof localize;
  }> = () => null;
  const $changed = createStore<typeof localize>(localize);

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: $changed,
    },
  });

  expectType<FC>(ReflectedInput);
}

// should support useUnit configuration
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: (e) => {
        expectType<string>(e);
        changed(e);
      },
    },
    useUnitConfig: {
      forceScope: true,
    },
  });
}

// should not support invalud useUnit configuration
{
  const Input: FC<{
    value: string;
    onChange: (newValue: string) => void;
  }> = () => null;
  const changed = createEvent<string>();

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
      onChange: (e) => {
        expectType<string>(e);
        changed(e);
      },
    },
    useUnitConfig: {
      // @ts-expect-error
      forseScope: true,
    },
  });
}

// reflect fits ComponentType
{
  const Input = (props: PropsWithChildren<{ value: string }>) => null;

  const ReflectedInput = reflect({
    view: Input,
    bind: {
      value: 'plain string',
    },
  });

  const Test: ComponentType<{ value: string; children: ReactNode }> = Input;
}

// reflect supports mounted as EventCallable<void>
{
  type Props = { loading: boolean };

  const mounted = createEvent();
  const unmounted = createEvent();

  const Foo: FC<Props> = (props) => <></>;

  const $loading = createStore(true);

  const Bar = reflect({
    view: Foo,
    bind: {
      loading: $loading,
    },
    hooks: { mounted, unmounted },
  });
}

// reflect supports mounted as EventCallable<Props>
{
  type Props = { loading: boolean };

  const mounted = createEvent<Props>();
  const unmounted = createEvent<Props>();

  const Foo: FC<Props> = (props) => <></>;

  const $loading = createStore(true);

  const Bar = reflect({
    view: Foo,
    bind: {
      loading: $loading,
    },
    hooks: { mounted, unmounted },
  });
}

// should error if mounted event doesn't satisfy component props
{
  const mounted = createEvent<{ foo: string }>();
  const unmounted = createEvent<{ foo: string }>();

  const Foo: FC<{ bar: number }> = () => null;

  const Bar = reflect({
    view: Foo,
    // @ts-expect-error
    hooks: { mounted, unmounted },
  });
}

// reflect supports partial match of mounted event and component props
{
  const mounted = createEvent<{ foo: string }>();
  const unmounted = createEvent<{ foo: string }>();

  const Foo: FC<{ foo: string; bar: number }> = () => null;

  const Bar = reflect({
    view: Foo,
    bind: {
      foo: 'foo',
      bar: 42,
    },
    hooks: { mounted, unmounted },
  });
}

// reflect supports partial match of mounted callback and component props
{
  const mounted = (args: { foo: string }) => {};
  const unmounted = (args: { foo: string }) => {};

  const Foo: FC<{ foo: string; bar: number }> = () => null;

  const Bar = reflect({
    view: Foo,
    bind: {
      foo: 'foo',
      bar: 42,
    },
    hooks: { mounted, unmounted },
  });
}
