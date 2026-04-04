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

import { ParentComponent, ParentProps, JSX } from 'solid-js'

import Button, { ButtonProps } from '../button'

export interface ModalProps extends ParentProps {
  width?: number
  title?: JSX.Element
  buttons?: ButtonProps[]
  onClose?: () => void
}

const Modal: ParentComponent<ModalProps> = (props) => {
  return (
    <div
      class="klinecharts-pro-modal">
      <div
        style={{ width: `${props.width ?? 400}px` }}
        class="inner">
        <div
          class="title-container">
          {props.title}
          <svg
            class="close-icon"
            viewBox="0 0 24 24"
            onClick={props.onClose}>
            <path
              d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" fill="currentColor" />
          </svg>
        </div>
        <div
          class="content-container">
          {props.children}
        </div>
        {
          (props.buttons && props.buttons.length > 0) && (
            <div
              class="button-container">
              {
                props.buttons.map(button => {
                  return (
                    <Button {...button}>
                      {button.children}
                    </Button>
                  )
                })
              }
            </div>
          )
        }
      </div>
    </div>
  )
}

export default Modal
