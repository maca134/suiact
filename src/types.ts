declare global {
	namespace Suiact {
		type Props<P = object, E = unknown> = P & {
			ref?: Ref<E>;
			ctx?: unknown;
			children?: JSX.Element | JSX.Element[]
		}

		type JSXElementConstructor<P = object> = (props: P) => Element | null;

		type Element<P = object, T extends string | JSXElementConstructor = string | JSXElementConstructor> = {
			type: T;
			props: P;
			ref?: Ref<unknown>;
			ctx?: unknown;
		}

		type Ref<T = unknown> = { current: T };

		type FunctionComponent<P = object> = {
			(props: Props<P>): Element | null;
			defaultProps?: Partial<P> | undefined;
			displayName?: string | undefined;
		}

		type Component = FunctionComponent | string;

		type Fiber<T = any> = {
			type: Component,
			props: Props,
			element?: T,
			ref?: Ref<T>,
			effectTag?: 'PLACEMENT' | 'UPDATE' | 'DELETION',

			ctx?: unknown,
			parent?: Fiber,
			child?: Fiber,
			sibling?: Fiber,
			prev?: Fiber,
		}
	}

	namespace ScriptUI {
		type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;

		type WritableKeys<T> = { [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] extends () => unknown ? never : T[P] }, P> }[keyof T];

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		type EventKeys<T> = { [K in keyof T]: T[K] extends () => unknown ? K extends `on${infer _X}` ? K : never : never }[keyof T];

		type EventProps<T> = { [K in EventKeys<T>]?: (control: T) => void };

		type BaseProps<T> = {
			/**
			 * Creation properties.
			 */
			properties: T,

			/**
			 * Preferred width of the control.
			 */
			width: number,

			/**
			 * Preferred height of the control.
			 */
			height: number,
		};

		type ElementProps<T, U = _AddControlProperties> = Partial<BaseProps<U> & Pick<T, Exclude<WritableKeys<T>, 'preferredSize'>> & EventProps<T>>;

		type Props<T, U = _AddControlProperties> = Suiact.Props<ElementProps<T, U>, T>;

		type WindowProps = Props<Window, _AddControlPropertiesWindow> & {
			/**
			 * The type of the window.
			 * 
			 * Allowed values:
			 * 
			 * `dialog` - Creates a modal dialog.
			 *
			 * `palette` - Creates a modeless dialog, also called a floating palette.
			 *
			 * `window` - Creates a simple window that can be used as a main window for an application.
			*/
			type: "dialog" | "palette" | "window",
			/**
			 * Set the parent panel. When this is set, this is used instead of creating a new window. For use with dockable panels.
			 */
			usePanel?: Panel,
		};
		type GroupProps = Props<Group>;
		type PanelProps = Props<Panel, _AddControlPropertiesPanel>;
		type StaticTextProps = Props<StaticText, _AddControlPropertiesStaticText>;
		type EditTextProps = Props<EditText, _AddControlPropertiesEditText>;
		type ButtonProps = Props<Button>;
		type CheckboxProps = Props<Checkbox>;
		type RadioButtonProps = Props<RadioButton>;
		type DropDownListProps = Props<DropDownList, _AddControlPropertiesDropDownList>;
		type SliderProps = Props<Slider>;
		type ListBoxProps = Props<ListBox, _AddControlPropertiesListBox>;
		type ImageProps = Props<Image>;
		type IconButtonProps = Props<IconButton, _AddControlPropertiesIconButton>;
		type ProgressbarProps = Props<Progressbar>;
		type TabProps = Props<Tab, _AddControlPropertiesPanel>;
		type TabbedPanelProps = Props<TabbedPanel, _AddControlPropertiesPanel>;
		type TreeViewProps = Props<TreeView, _AddControlPropertiesTreeView>;
		type ListItemProps = Props<ListItem>;
	}

	namespace JSX {
		type ElementAttributesProperty = { props: object; }
		type ElementChildrenAttribute = { children: object; }

		type Element = Suiact.Element;

		type IntrinsicElements = {
			window: ScriptUI.WindowProps,
			group: ScriptUI.GroupProps,
			panel: ScriptUI.PanelProps,
			statictext: ScriptUI.StaticTextProps,
			edittext: ScriptUI.EditTextProps,
			button: ScriptUI.ButtonProps,
			checkbox: ScriptUI.CheckboxProps,
			radiobutton: ScriptUI.RadioButtonProps,
			dropdownlist: ScriptUI.DropDownListProps,
			slider: ScriptUI.SliderProps,
			listbox: ScriptUI.ListBoxProps,
			image: ScriptUI.ImageProps,
			iconbutton: ScriptUI.IconButtonProps,
			progressbar: ScriptUI.ProgressbarProps,
			tab: ScriptUI.TabProps,
			tabbedpanel: ScriptUI.TabbedPanelProps,
			treeview: ScriptUI.TreeViewProps,
			item: ScriptUI.ListItemProps,
		}
	}
}

export {};