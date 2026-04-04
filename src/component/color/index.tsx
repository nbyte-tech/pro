/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, JSX, Show, createSignal, For } from 'solid-js'

export interface ColorProps {
  style?: JSX.CSSProperties | string
  value: string
  showValue?: boolean
  onChange: (value: string) => void
}

const COLORS = [
  '#1677FF', '#2196F3', '#00BCD4', '#26A69A',
  '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B',
  '#FFC107', '#FF9800', '#FF5722', '#F44336',
  '#EF5350', '#E91E63', '#9C27B0', '#673AB7'
]

const Color: Component<ColorProps> = props => {
  const [open, setOpen] = createSignal(false)
  const value = () => props.value || '#2196F3'
  const showValue = () => props.showValue ?? true
  return (
    <div
      classList={{
        'klinecharts-pro-color': true,
        'klinecharts-pro-color-show': open()
      }}
      style={props.style}
      tabIndex="0"
      onClick={e => {
        e.stopPropagation()
        setOpen(o => !o)
      }}
      onBlur={_ => { setOpen(false) }}>
      <div class="swatch" style={{ background: value() }}/>
      <Show when={showValue()}>
        <span>{value().toUpperCase()}</span>
      </Show>
      <div class="drop-down-container">
        <div class="palette">
          <For each={COLORS}>
            {
              (c) => (
                <div
                  classList={{
                    'color-item': true,
                    active: c === value()
                  }}
                  style={{ background: c }}
                  onClick={e => {
                    e.stopPropagation()
                    props.onChange(c)
                    setOpen(false)
                  }}/>
              )
            }
          </For>
        </div>
      </div>
    </div>
  )
}

export default Color
