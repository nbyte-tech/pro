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

import { KLineData, IndicatorTemplate, utils } from 'klinecharts'

export interface VOL {
  volume?: number
}

const vol: IndicatorTemplate<VOL> = {
  name: 'VOL',
  shortName: 'VOL',
  calcParams: [],
  figures: [
    {
      key: 'volume',
      title: 'VOLUME: ',
      type: 'bar',
      baseValue: 0,
      styles: (data: any, indicator: any, defaultStyles: any) => {
        const kLineData = data.current.kLineData
        if (kLineData) {
          let color = utils.formatValue(indicator.styles, 'bars[0].noChangeColor', defaultStyles.bars[0].noChangeColor) as string
          if (kLineData.close > kLineData.open) {
            color = utils.formatValue(indicator.styles, 'bars[0].upColor', defaultStyles.bars[0].upColor) as string
          } else if (kLineData.close < kLineData.open) {
            color = utils.formatValue(indicator.styles, 'bars[0].downColor', defaultStyles.bars[0].downColor) as string
          }
          return { color }
        }
        return {}
      }
    }
  ],
  calc: (dataList: KLineData[]) => {
    return dataList.map((kLineData: KLineData) => ({ volume: kLineData.volume }))
  },
  draw: (params) => {
    const { ctx, visibleRange, indicator, xAxis, bounding, barSpace, kLineDataList } = params
    const { from, to } = visibleRange
    const result = indicator.result
    const paneId = (indicator as any).paneId
    
    // If it's NOT in candle_pane, klinecharts handles it normally via figures.
    if (paneId !== 'candle_pane') {
       return false
    }

    // Overlay mode logic (bottom 20% of the pane)
    const height = bounding.height
    const paddingBottom = 2
    const overlayHeight = height * 0.2
    
    let maxVol = 0
    for (let i = from; i < to; i++) {
        const val = result[i]?.volume || 0
        if (val > maxVol) maxVol = val
    }
    
    if (maxVol === 0) return true

    const barWidth = barSpace.bar

    for (let i = from; i < to; i++) {
        const item = result[i]
        if (!item || item.volume === undefined) continue
        
        const x = xAxis.convertToPixel(i)
        const v = item.volume
        const h = (v / maxVol) * overlayHeight
        const y = height - h - paddingBottom
        
        const kLineData = kLineDataList[i]
        let color = 'rgba(153, 153, 153, 0.5)'
        if (kLineData.close > kLineData.open) {
            color = 'rgba(38, 166, 154, 0.5)'
        } else if (kLineData.close < kLineData.open) {
            color = 'rgba(239, 83, 80, 0.5)'
        }
        
        ctx.fillStyle = color
        ctx.fillRect(x - barWidth / 2, y, barWidth, h)
    }

    return true
  }
}

export default vol
