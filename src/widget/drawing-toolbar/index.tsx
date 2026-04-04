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

import { Component, createMemo } from 'solid-js'
import { Overlay } from 'klinecharts'
import { Color, Select } from '../../component'
import { Icon } from '../drawing-bar/icons'
import i18n from '../../i18n'

export interface DrawingToolbarProps {
  locale: string
  overlay: Overlay
  onColorChange: (color: string) => void
  onSizeChange: (size: number) => void
  onTypeChange: (type: string) => void
  onLockChange: (lock: boolean) => void
  onVisibleChange: (visible: boolean) => void
  onRemoveClick: () => void
  onClose: () => void
}

const DrawingToolbar: Component<DrawingToolbarProps> = (props) => {
  const styles = createMemo(() => props.overlay.styles || {})

  const color = createMemo(() => {
    return styles().line?.color || styles().polygon?.borderColor || styles().circle?.borderColor || styles().rect?.borderColor || styles().text?.color || styles().arc?.color || styles().rectText?.color || '#2196F3'
  })

  const size = createMemo(() => {
    return styles().line?.size || styles().polygon?.borderSize || styles().circle?.borderSize || styles().rect?.borderSize || styles().arc?.size || 1
  })

  const type = createMemo(() => {
    const s = styles() as any
    return s.line?.style || s.polygon?.borderStyle || s.circle?.borderStyle || s.rect?.borderStyle || s.arc?.style || 'solid'
  })

  return (
    <div class="klinecharts-pro-drawing-toolbar">
      <div class="icon">
        <Icon name={props.overlay.name} />
      </div>
      <div class="item">
        <Color
          value={color()}
          showValue={false}
          onChange={props.onColorChange}/>
      </div>
      <div class="item">
        <Select
          style={{ width: '60px' }}
          value={size().toString()}
          dataSource={[1, 2, 3, 4, 5].map(s => ({ key: s.toString(), text: s.toString() }))}
          onSelected={(item) => {
            const v = typeof item === 'object' ? item.key : item
            props.onSizeChange(parseInt(v as string, 10))
          }}/>
      </div>
      <div class="item">
        <Select
          style={{ width: '80px' }}
          value={i18n(type(), props.locale)}
          dataSource={[
            { key: 'solid', text: i18n('solid', props.locale) },
            { key: 'dashed', text: i18n('dashed', props.locale) }
          ]}
          onSelected={(item) => {
            const v = typeof item === 'object' ? item.key : item
            props.onTypeChange(v as string)
          }}/>
      </div>
      <div class="item" onClick={() => props.onLockChange(!props.overlay.lock)}>
        <Icon name={props.overlay.lock ? 'lock' : 'unlock'} />
      </div>
      <div class="item" onClick={() => props.onVisibleChange(!props.overlay.visible)}>
        <Icon name={props.overlay.visible ? 'visible' : 'invisible'} />
      </div>
      <div class="item" onClick={props.onRemoveClick}>
        <Icon name="remove" />
      </div>
    </div>
  )
}

export default DrawingToolbar
