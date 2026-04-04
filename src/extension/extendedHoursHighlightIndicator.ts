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

import { IndicatorTemplate, KLineData } from 'klinecharts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const extendedHoursHighlightIndicator: IndicatorTemplate = {
  name: 'EXTENDED_HOURS_HIGHLIGHT',
  shortName: 'EXT',
  calc: (dataList: KLineData[]) => {
    return dataList.map(_ => ({}))
  },
  draw: (params) => {
    const { ctx, kLineDataList, visibleRange, bounding, barSpace, xAxis } = params
    const { from, to } = visibleRange
    
    const preMarketColor = 'rgba(0, 150, 255, 0.05)'
    const afterMarketColor = 'rgba(255, 165, 0, 0.05)'

    const getSession = (timestamp: number) => {
      const nyTime = dayjs(timestamp)
      const hour = nyTime.hour()
      const minute = nyTime.minute()
      const totalMinutes = hour * 60 + minute

      if (totalMinutes >= 4 * 60 && totalMinutes < 9 * 60 + 30) {
        return 'pre'
      }
      if (totalMinutes >= 16 * 60 && totalMinutes < 20 * 60) {
        return 'after'
      }
      return ''
    }

    let currentSession = ''
    let startX = 0

    for (let i = from; i < to; i++) {
        const data = kLineDataList[i]
        const session = getSession(data.timestamp)
        const x = xAxis.convertToPixel(i)
        const halfBarSpace = barSpace.halfBar

        if (session !== currentSession) {
            if (currentSession) {
                const endX = x - halfBarSpace
                ctx.fillStyle = currentSession === 'pre' ? preMarketColor : afterMarketColor
                ctx.fillRect(startX, 0, endX - startX, bounding.height)
            }
            currentSession = session
            startX = x - halfBarSpace
        }

        if (i === to - 1 && currentSession) {
            const endX = x + halfBarSpace
            ctx.fillStyle = currentSession === 'pre' ? preMarketColor : afterMarketColor
            ctx.fillRect(startX, 0, endX - startX, bounding.height)
        }
    }
    return true
  }
}

export default extendedHoursHighlightIndicator
