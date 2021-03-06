/* Copyright (C) 2018-2019 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Listener, Stream} from 'xstream';
import DialogAndroid from 'react-native-dialogs';
import {Platform, Alert, AlertButton} from 'react-native';

export type Command =
  | {type: 'dismiss'}
  | {type: 'alert'; title?: string; content?: string; options?: OptionsCommon};

export type ButtonStyleIOS = 'default' | 'cancel' | 'destructive';

export type OptionsCommon = {
  cancelable?: boolean;
  forceStacking?: boolean;

  title?: string;
  titleColor?: string;

  content?: string;
  contentColor?: string;
  contentIsHtml?: boolean;
  linkColor?: string;

  negativeColor?: string;
  negativeStyleIOS?: ButtonStyleIOS;
  negativeText?: string;

  neutralColor?: string;
  neutralStyleIOS?: ButtonStyleIOS;
  neutralText?: string;

  positiveColor?: string;
  positiveStyleIOS?: ButtonStyleIOS;
  positiveText?: string; // default "OK"
};

export type PickerItem = {
  label?: string;
  id?: any;
  iosStyle?: AlertButton['style'];
};

export type OptionsPicker = OptionsCommon & {
  items: Array<PickerItem>;
  idKey?: string;
  labelKey?: string;
  neutralIsClear?: boolean;
  selectedId?: any;
  selectedIds?: any[];
  type?: 'listCheckbox' | 'listPlain' | 'listRadio';
  widgetColor?: string;
};

export type OptionsPrompt = OptionsCommon & {
  widgetColor?: string;
};

export type AlertAction = {
  action:
    | 'actionDismiss'
    | 'actionNegative'
    | 'actionNeutral'
    | 'actionPositive';
};

export type PickerAction =
  | {action: 'actionNegative' | 'actionNeutral' | 'actionDismiss'}
  | {
      action: 'actionSelect';
      selectedItem: any;
    };

export type PromptAction =
  | {action: 'actionNegative' | 'actionNeutral' | 'actionDismiss'}
  | {action: 'actionPositive'; text: string; checked?: boolean};

export class DialogSource {
  constructor() {}

  public alert(
    title?: string,
    content?: string,
    options?: OptionsCommon,
  ): Stream<AlertAction> {
    if (Platform.OS === 'android') {
      return xs.fromPromise(DialogAndroid.alert(title, content, options));
    } else {
      return xs.create({
        start: (listener: Listener<AlertAction>) => {
          const buttons: Array<AlertButton> = [];
          if (options?.positiveText) {
            buttons.push({
              text: options.positiveText,
              style: options.positiveStyleIOS ?? 'default',
              onPress: () => listener.next({action: 'actionPositive'}),
            });
          }
          if (options?.negativeText) {
            buttons.push({
              text: options.negativeText,
              style: options.negativeStyleIOS ?? 'default',
              onPress: () => listener.next({action: 'actionNegative'}),
            });
          }
          if (options?.neutralText) {
            buttons.push({
              text: options.neutralText,
              style: options.neutralStyleIOS ?? 'default',
              onPress: () => listener.next({action: 'actionNeutral'}),
            });
          }
          if (!options) {
            buttons.push({
              text: 'OK',
              style: 'default',
              onPress: () => listener.next({action: 'actionPositive'}),
            });
          }
          Alert.alert(title ?? '', content ?? '', buttons, {
            cancelable: true,
            onDismiss: () => listener.next({action: 'actionDismiss'}),
          });
        },
        stop: () => {},
      });
    }
  }

  public showPicker(
    title?: string,
    content?: string,
    options?: OptionsPicker,
  ): Stream<PickerAction> {
    if (Platform.OS === 'android') {
      return xs.fromPromise(DialogAndroid.showPicker(title, content, options));
    } else {
      return xs.create({
        start: (listener: Listener<PickerAction>) => {
          const buttons: Array<AlertButton> = [];
          if (options) {
            for (const item of options.items) {
              buttons.push({
                text: item.label,
                style: item.iosStyle ?? 'default',
                onPress: () =>
                  listener.next({
                    action: 'actionSelect',
                    selectedItem: {id: item.id},
                  }),
              });
            }
          }
          buttons.push({
            text: 'Cancel',
            style: 'cancel',
            onPress: () => listener.next({action: 'actionDismiss'}),
          });
          Alert.alert(title ?? '', content, buttons);
        },
        stop: () => {},
      });
    }
  }

  public prompt(
    title?: string,
    content?: string,
    options?: OptionsPrompt,
  ): Stream<PromptAction> {
    if (Platform.OS === 'android') {
      return xs.fromPromise(DialogAndroid.prompt(title, content, options));
    } else {
      return xs.create({
        start: (listener: Listener<PromptAction>) => {
          const buttons = [
            {
              text: options?.positiveText ?? 'OK',
              onPress: (text: string) => {
                listener.next({action: 'actionPositive', text});
              },
            },
          ];
          Alert.prompt(title ?? '', content, buttons);
        },
        stop: () => {},
      });
    }
  }
}

export function dialogDriver(command$: Stream<Command>): DialogSource {
  command$.subscribe({
    next: cmd => {
      if (cmd.type === 'dismiss') {
        DialogAndroid.dismiss();
      }
      if (cmd.type === 'alert') {
        DialogAndroid.alert(cmd.title, cmd.content, cmd.options);
      }
    },
  });

  return new DialogSource();
}
