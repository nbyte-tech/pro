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

import { KLineData, Indicator, IndicatorTemplate, IndicatorFigure, utils } from 'klinecharts'

export interface MACD {
  dif?: number
  dea?: number
  macd?: number
}

const macd: IndicatorTemplate<MACD> = {
  name: 'MACD',
  shortName: 'MACD',
  calcParams: [12, 26, 9, 1],
  figures: [
    { key: 'dif', title: 'DIF: ', type: 'line' },
    { key: 'dea', title: 'DEA: ', type: 'line' },
    {
      key: 'macd',
      title: 'MACD: ',
      type: 'bar',
      baseValue: 0,
      styles: (data: any, indicator: any, defaultStyles: any) => {
        const currentMacd = data.current.indicatorData?.macd
        let color = utils.formatValue(indicator.styles, 'bars[0].noChangeColor', defaultStyles.bars[0].noChangeColor) as string
        if (currentMacd > 0) {
          color = utils.formatValue(indicator.styles, 'bars[0].upColor', defaultStyles.bars[0].upColor) as string
        } else if (currentMacd < 0) {
          color = utils.formatValue(indicator.styles, 'bars[0].downColor', defaultStyles.bars[0].downColor) as string
        }
        return { color }
      }
    }
  ],
  regenerateFigures: (calcParams: any[]) => {
    const showHistogram = calcParams[3] ?? 1
    const figures: IndicatorFigure[] = [
      { key: 'dif', title: 'DIF: ', type: 'line' },
      { key: 'dea', title: 'DEA: ', type: 'line' }
    ]
    if (showHistogram !== 0) {
      figures.push({
        key: 'macd',
        title: 'MACD: ',
        type: 'bar',
        baseValue: 0,
        styles: (data: any, indicator: any, defaultStyles: any) => {
          const currentMacd = data.current.indicatorData?.macd
          let color = utils.formatValue(indicator.styles, 'bars[0].noChangeColor', defaultStyles.bars[0].noChangeColor) as string
          if (currentMacd > 0) {
            color = utils.formatValue(indicator.styles, 'bars[0].upColor', defaultStyles.bars[0].upColor) as string
          } else if (currentMacd < 0) {
            color = utils.formatValue(indicator.styles, 'bars[0].downColor', defaultStyles.bars[0].downColor) as string
          }
          return { color }
        }
      })
    }
    return figures
  },
  calc: (dataList: KLineData[], indicator: Indicator<MACD>) => {
    const { calcParams } = indicator
    const fastPeriod = calcParams[0]
    const slowPeriod = calcParams[1]
    const signalPeriod = calcParams[2]
    
    let emaFast = 0
    let emaSlow = 0
    let dea = 0
    const difList: number[] = []
    
    const k1 = 2 / (fastPeriod + 1)
    const k2 = 2 / (slowPeriod + 1)
    const k3 = 2 / (signalPeriod + 1)
    
    return dataList.map((kLineData: KLineData, i: number) => {
      const close = kLineData.close
      if (i === 0) {
        emaFast = close
        emaSlow = close
      } else {
        emaFast = k1 * (close - emaFast) + emaFast
        emaSlow = k2 * (close - emaSlow) + emaSlow
      }
      
      const dif = emaFast - emaSlow
      difList.push(dif)
      
      if (i === 0) {
        dea = dif
      } else {
        dea = k3 * (dif - dea) + dea
      }
      
      return {
        dif,
        dea,
        macd: (dif - dea) * 2
      }
    })
  }
}

export default macd
