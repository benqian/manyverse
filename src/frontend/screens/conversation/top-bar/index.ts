/* Copyright (C) 2020 The Manyverse Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import xs, {Stream} from 'xstream';
import {ReactSource} from '@cycle/react';
import {h} from '@cycle/react';
import {ReactElement} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Palette} from '../../../global-styles/palette';
import {Dimensions} from '../../../global-styles/dimens';
import {Typography} from '../../../global-styles/typography';
import HeaderBackButton from '../../../components/HeaderBackButton';
import HeaderButton from '../../../components/HeaderButton';

export type Sources = {
  screen: ReactSource;
};

export type Sinks = {
  screen: Stream<ReactElement<any>>;
  back: Stream<any>;
  goToRecipients$: Stream<any>;
};

export const styles = StyleSheet.create({
  container: {
    height: Dimensions.toolbarHeight,
    paddingTop: getStatusBarHeight(true),
    alignSelf: 'stretch',
    backgroundColor: Palette.backgroundBrand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: Dimensions.horizontalSpaceBig,
  },

  title: {
    fontFamily: Typography.fontFamilyReadableText,
    color: Palette.textForBackgroundBrand,
    fontSize: Typography.fontSizeLarge,
    fontWeight: 'bold',
    ...Platform.select({
      ios: {
        position: 'absolute',
        top: getStatusBarHeight() + Dimensions.verticalSpaceIOSTitle,
        left: 40,
        right: 40,
        textAlign: 'center',
        marginLeft: 0,
      },
      default: {
        marginLeft: Dimensions.horizontalSpaceLarge,
      },
    }),
  },

  spacer: {
    flex: 1,
  },
});

export function topBar(sources: Sources): Sinks {
  const vdom$ = xs.of(
    h(View, {style: styles.container}, [
      HeaderBackButton('conversationBackButton'),
      h(Text, {style: styles.title}, 'Conversation'),
      h(View, {style: styles.spacer}),
      h(HeaderButton, {
        sel: 'showRecipients',
        icon: 'account-multiple',
        accessibilityLabel: 'Recipients Button',
        side: 'right',
      }),
    ]),
  );

  const back$ = sources.screen.select('conversationBackButton').events('press');
  const goToRecipients$ = sources.screen
    .select('showRecipients')
    .events('press');

  return {
    screen: vdom$,
    back: back$,
    goToRecipients$,
  };
}
