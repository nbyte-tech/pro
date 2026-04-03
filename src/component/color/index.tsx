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

import { Component, JSX } from 'solid-js'

export interface ColorProps {
  style?: JSX.CSSProperties | string
  value: string
  onChange: (value: string) => void
}

const Color: Component<ColorProps> = props => {
  return (
    <div
      class="klinecharts-pro-color"
      style={props.style}>
      <input
        type="color"
        value={props.value}
        onInput={(e) => {
          props.onChange(e.currentTarget.value)
        }}/>
      <span>{props.value.toUpperCase()}</span>
    </div>
  )
}

export default Color
