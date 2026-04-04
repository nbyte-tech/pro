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

import { Component, createSignal, JSX, createEffect } from 'solid-js'


const CheckedIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      class="icon">
      <path
        d="M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M10,17L5,12L6.41,10.59L10,14.17L17.59,6.58L19,8L10,17Z" fill="currentColor"/>
    </svg>
  )
}

const NormalIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      class="icon">
      <path
        d="M19,5V19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" fill="currentColor"/>
    </svg>
  )
}

export interface CheckboxProps {
  class?: string
  style?: JSX.CSSProperties | string
  checked?: boolean
  label?: JSX.Element
  onChange?: (checked: boolean) => void
}

const Checkbox: Component<CheckboxProps> = props => {
  const [innerChecked, setInnderChecked] = createSignal(props.checked ?? false)

  createEffect(() => {
    if ('checked' in props) {
      setInnderChecked(props.checked as boolean)
    }
  })

  return (
    <div
      style={props.style}
      class={`klinecharts-pro-checkbox ${(innerChecked() && 'checked') || ''} ${props.class || ''}`}
      onClick={_ => {
        const ck = !innerChecked();
        props.onChange && props.onChange(ck);
        setInnderChecked(ck);
      }}>
      {innerChecked() ? <CheckedIcon/> : <NormalIcon/>}
      {
      props.label && <span class="label">{props.label}</span>}
    </div>
  )
}

export default Checkbox
