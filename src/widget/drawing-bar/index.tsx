/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, createMemo, createSignal } from 'solid-js'

import { OverlayCreate, OverlayMode } from 'klinecharts'

import i18n from '../../i18n'
import { List } from '../../component'
import {
  createSingleLineOptions, createMoreLineOptions,
  createPolygonOptions, createFibonacciOptions, createWaveOptions,
  createMagnetOptions,
  Icon, formatHotkey
} from './icons'

export interface DrawingBarProps {
  locale: string
  onDrawingItemClick: (overlay: OverlayCreate) => void
  onModeChange: (mode: string) => void,
  onLockChange: (lock: boolean) => void
  onVisibleChange: (visible: boolean) => void
  onRemoveClick: (groupId: string, all?: boolean) => void
  onResetClick: () => void
}

const GROUP_ID = 'drawing_tools'

const DrawingBar: Component<DrawingBarProps> = props => {
  const [singleLineIcon, setSingleLineIcon] = createSignal('horizontalStraightLine')
  const [moreLineIcon, setMoreLineIcon] = createSignal('priceChannelLine')
  const [polygonIcon, setPolygonIcon] = createSignal('circle')
  const [fibonacciIcon, setFibonacciIcon] = createSignal('fibonacciLine')
  const [waveIcon, setWaveIcon] = createSignal('xabcd')

  const [modeIcon, setModeIcon] = createSignal('weak_magnet')
  const [mode, setMode] = createSignal('normal')

  const [lock, setLock] = createSignal(false)

  const [visible, setVisible] = createSignal(true)

  const [popoverKey, setPopoverKey] = createSignal('')

  const overlays = createMemo(() => {
    return [
      { key: 'singleLine', icon: singleLineIcon(), list: createSingleLineOptions(props.locale), setter: setSingleLineIcon },
      { key: 'moreLine', icon: moreLineIcon(), list: createMoreLineOptions(props.locale), setter: setMoreLineIcon },
      { key: 'polygon', icon: polygonIcon(), list: createPolygonOptions(props.locale), setter: setPolygonIcon },
      { key: 'fibonacci', icon: fibonacciIcon(), list: createFibonacciOptions(props.locale), setter: setFibonacciIcon },
      { key: 'wave', icon: waveIcon(), list: createWaveOptions(props.locale), setter: setWaveIcon }
    ]
  })

  const modes = createMemo(() => createMagnetOptions(props.locale))

  return (
    <div
      class="klinecharts-pro-drawing-bar">
      {
        overlays().map(item => {
          const currentItem = item.list.find(it => it.key === item.icon)
          return (
            <div
              class="item"
              tabIndex={0}
              title={currentItem ? (currentItem.hotkey ? `${currentItem.text} (${currentItem.hotkey})` : (currentItem.text as string)) : ''}
              onBlur={() => { setPopoverKey('') }}>
              <span
                style="width:24px;height:24px;padding-bottom:2px"
                onClick={() => { props.onDrawingItemClick({ groupId: GROUP_ID, name: item.icon, visible: visible(), lock: lock(), mode: mode() as OverlayMode }) }}>
                <Icon name={item.icon} />
              </span>
              <div
                class="icon-arrow"
                onClick={() => {
                  if (item.key === popoverKey()) {
                    setPopoverKey('')
                  } else {
                    setPopoverKey(item.key)
                  }
                }}>
                <svg
                  class={item.key === popoverKey() ? 'rotate' : ''}
                  viewBox="0 0 24 24">
                  <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" fill="currentColor"/>
                </svg>
              </div>
              {
                item.key === popoverKey() && (
                  <List class="list">
                    {
                      item.list.map(data => (
                        <li
                          onClick={() => {
                            item.setter(data.key)
                            props.onDrawingItemClick({ name: data.key, lock: lock(), mode: mode() as OverlayMode })
                            setPopoverKey('')
                          }}>
                          <Icon name={data.key}/>
                          <span style="flex:1;padding-left:8px">{data.text}</span>
                          {data.hotkey && <span class="hotkey">{data.hotkey}</span>}
                        </li>
                      ))
                    }
                  </List>
                )
              }
            </div>
          )
        })
      }
      <span class="split-line"/>
      <div
        class="item"
        tabIndex={0}
        onBlur={() => { setPopoverKey('') }}>
        <span
          style="width:24px;height:24px;padding-bottom:2px"
          onClick={() => {
            let currentMode = modeIcon()
            if (mode() !== 'normal') {
              currentMode = 'normal'
            }
            setMode(currentMode)
            props.onModeChange(currentMode)
          }}>
          {
            modeIcon() === 'weak_magnet'
              ? (mode() === 'weak_magnet' ? <Icon name="weak_magnet" class="selected"/> : <Icon name="weak_magnet"/>) 
              : (mode() === 'strong_magnet' ? <Icon name="strong_magnet" class="selected"/> : <Icon name="strong_magnet"/>)
          }
        </span>
        <div
          class="icon-arrow"
          onClick={() => {
            if (popoverKey() === 'mode') {
              setPopoverKey('')
            } else {
              setPopoverKey('mode')
            }
          }}>
          <svg
            class={popoverKey() === 'mode' ? 'rotate' : ''}
            viewBox="0 0 24 24">
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" fill="currentColor"/>
          </svg>
        </div>
        {
          popoverKey() === 'mode' && (
            <List class="list">
              {
                modes().map(data => (
                  <li
                    onClick={() => {
                      setModeIcon(data.key)
                      setMode(data.key)
                      props.onModeChange(data.key)
                      setPopoverKey('')
                    }}>
                    <Icon name={data.key}/>
                    <span style="padding-left:8px">{data.text}</span>
                  </li>
                ))
              }
            </List>
          )
        }
      </div>
      <div
        class="item">
        <span
          style="width:24px;height:24px;padding-bottom:2px"
          onClick={() => {
            const currentLock = !lock()
            setLock(currentLock)
            props.onLockChange(currentLock)
          }}>
          {
            lock() ? <Icon name="lock"/> : <Icon name="unlock" />
          }
        </span>
      </div>
      <div
        class="item">
        <span
          style="width:24px;height:24px;padding-bottom:2px"
          onClick={() => {
            const v = !visible()
            setVisible(v)
            props.onVisibleChange(v)
          }}>
          {
            visible() ? <Icon name="visible" /> : <Icon name="invisible" />
          }
        </span>
      </div>
      <span class="split-line"/>
      <div
        class="item"
        tabIndex={0}
        onBlur={() => { setPopoverKey('') }}>
        <span
          style="width:24px;height:24px;padding-bottom:2px"
          onClick={() => { props.onRemoveClick(GROUP_ID) }}>
          <Icon name="remove" />
        </span>
        <div
          class="icon-arrow"
          onClick={() => {
            if (popoverKey() === 'remove') {
              setPopoverKey('')
            } else {
              setPopoverKey('remove')
            }
          }}>
          <svg
            class={popoverKey() === 'remove' ? 'rotate' : ''}
            viewBox="0 0 24 24">
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" fill="currentColor"/>
          </svg>
        </div>
        {
          popoverKey() === 'remove' && (
            <List class="list">
              <li
                onClick={() => {
                  props.onRemoveClick(GROUP_ID, false)
                  setPopoverKey('')
                }}>
                <Icon name="remove"/>
                <span style="flex:1;padding-left:8px">{i18n('remove_selected', props.locale)}</span>
                <span class="hotkey">{formatHotkey('c', 'cmd')}</span>
              </li>
              <li
                onClick={() => {
                  props.onRemoveClick(GROUP_ID, true)
                  setPopoverKey('')
                }}>
                <Icon name="remove"/>
                <span style="flex:1;padding-left:8px">{i18n('remove_all', props.locale)}</span>
              </li>
              <li
                onClick={() => {
                  props.onResetClick()
                  setPopoverKey('')
                }}>
                <Icon name="remove"/>
                <span style="flex:1;padding-left:8px">{i18n('reset_chart', props.locale)}</span>
                <span class="hotkey">{formatHotkey('r', 'alt')}</span>
              </li>
            </List>
          )
        }
      </div>
    </div>
  )
}

export default DrawingBar