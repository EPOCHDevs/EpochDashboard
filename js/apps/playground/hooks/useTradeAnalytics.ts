import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

export interface IRoundTrip {
  index: number
  asset_id: string
  asset: string
  side: string
  status: string
  open_datetime: string
  close_datetime: string | null
  net_return: number
  return_percent: number
  size: number
}

export interface GetTradeAnalyticsRoundTripsResponseType {
  items: IRoundTrip[]
  page: number
  total: number
}

interface UseGetTradeAnalyticsRoundTripsProps {
  strategyId: string
  apiUrl: string
  userId: string
}

export const useGetTradeAnalyticsRoundTrips = ({
  strategyId,
  apiUrl,
  userId,
}: UseGetTradeAnalyticsRoundTripsProps) => {
  return useInfiniteQuery({
    queryKey: ['TRADE_ANALYTICS_ROUND_TRIPS', strategyId],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await axios.get<GetTradeAnalyticsRoundTripsResponseType>(
        `/api/backend-server/dashboard/round-trips/${strategyId}?page=${pageParam}`,
        {
          headers: {
            'X-API-URL': apiUrl,
            'X-User-Id': userId,
          },
        }
      )
      return data
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.total === lastPage.page) return undefined
      return lastPage.page + 1
    },
    staleTime: Infinity,
    initialPageParam: 1,
    enabled: Boolean(strategyId),
  })
}
