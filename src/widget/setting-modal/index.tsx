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

import { Component, createEffect, For, createSignal, Show } from 'solid-js'
import { Styles, utils, DeepPartial } from 'klinecharts'

import lodashSet from 'lodash/set'

import { Modal, Select, Switch, Color } from '../../component'
import type { SelectDataSourceItem } from '../../component'

import i18n from '../../i18n'
import { getOptions } from './data'

export interface SettingModalProps {
  locale: string
  currentStyles: Styles
  timezone: SelectDataSourceItem
  onClose: () => void
  onChange: (style: DeepPartial<Styles>) => void
  onTimezoneChange: (timezone: SelectDataSourceItem) => void
  onRestoreDefault: (options: SelectDataSourceItem[]) => void
}

const SettingModal: Component<SettingModalProps> = props => {
  const [styles, setStyles] = createSignal(props.currentStyles)
  const [timezone, setTimezone] = createSignal(props.timezone)
  const [options, setOptions] = createSignal(getOptions(props.locale))

  createEffect(() => {
    setOptions(getOptions(props.locale))
  })

  const update = (option: any, newValue: any) => {
    if (option.key === 'timezone') {
      setTimezone(newValue as SelectDataSourceItem)
      props.onTimezoneChange(newValue as SelectDataSourceItem)
    } else {
      const style = {}
      const val = option.component === 'select' ? (newValue as SelectDataSourceItem).key : newValue
      lodashSet(style, option.key, val)
      const ss = utils.clone(styles())
      lodashSet(ss, option.key, val)
      setStyles(ss)
      props.onChange(style)
    }
    setOptions(options().map(op => ({ ...op })))
  }

  return (
    <Modal
      title={i18n('setting', props.locale)}
      width={560}
      buttons={[
        {
          children: i18n('restore_default', props.locale),
          onClick: () => {
            props.onRestoreDefault(options())
            props.onClose()
          }
        }
      ]}
      onClose={props.onClose}>
      <div
        class="klinecharts-pro-setting-modal-content">
        <For each={options()}>
          {
            (option, index) => {
              const showGroup = () => index() === 0 || options()[index() - 1].group !== option.group
              let component
              const value = option.key === 'timezone' ? timezone().key : utils.formatValue(styles(), option.key)
              switch (option.component) {
                case 'select': {
                  let displayValue: any
                  if (option.key === 'timezone') {
                    displayValue = timezone().text
                  } else {
                    displayValue = i18n(value as string, props.locale)
                  }
                  component = (
                    <Select
                      style={{ width: '120px' }}
                      value={displayValue}
                      dataSource={option.dataSource}
                      onSelected={(data) => {
                        update(option, data)
                      }}/>
                  )
                  break
                }
                case 'switch': {
                  const open = !!value
                  component = (
                    <Switch
                      open={open}
                      onChange={() => {
                        const newValue = !open
                        update(option, newValue)
                      }}/>
                  )
                  break
                }
                case 'color': {
                  component = (
                    <Color
                      value={value as string}
                      onChange={(newValue) => {
                        update(option, newValue)
                      }}/>
                  )
                  break
                }
              }
              return (
                <>
                  <Show when={showGroup()}>
                    <div class="group-title">{option.group}</div>
                  </Show>
                  <div class="item">
                    <span>{option.text}</span>
                    {component}
                  </div>
                </>
              )
            }
          }
        </For>
      </div> 
    </Modal>
  )
}

export default SettingModal
