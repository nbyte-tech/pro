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

import { KLineData, Indicator, IndicatorTemplate } from 'klinecharts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const vwap: IndicatorTemplate = {
  name: 'VWAP',
  shortName: 'VWAP',
  calcParams: [0], // 0: Session, 1: Weekly, 2: Monthly
  figures: [
    { key: 'vwap', title: 'VWAP: ', type: 'line' }
  ],
  calc: (dataList: KLineData[], indicator: Indicator) => {
    const type = indicator.calcParams[0]
    let sumPriceVolume = 0
    let sumVolume = 0
    let lastTime: dayjs.Dayjs | null = null

    return dataList.map((kLineData: KLineData) => {
      const currentTime = dayjs(kLineData.timestamp).tz('America/New_York')
      let isReset = false
      if (lastTime) {
        if (type === 0) { // Session
          isReset = !currentTime.isSame(lastTime, 'day')
        } else if (type === 1) { // Weekly
          isReset = !currentTime.isSame(lastTime, 'week')
        } else if (type === 2) { // Monthly
          isReset = !currentTime.isSame(lastTime, 'month')
        }
      }

      if (isReset) {
        sumPriceVolume = 0
        sumVolume = 0
      }

      const price = kLineData.turnover || kLineData.close
      const volume = kLineData.volume || 0
      
      sumPriceVolume += price * volume
      sumVolume += volume
      lastTime = currentTime

      return {
        vwap: sumVolume === 0 ? undefined : sumPriceVolume / sumVolume
      }
    })
  }
}

export default vwap
