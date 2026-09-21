// lib/data/transport.ts
export type TransportRoute = {
  id: string
  name: string
  vehicle_number: string
  driver_name: string
  driver_phone: string
  conductor_name: string
  conductor_phone: string
  incharge_name: string
  incharge_phone: string
}

export type TransportStop = {
  id: string
  route_id: string
  stop_name: string
  scheduled_time: string
  latitude: number
  longitude: number
}

export const DEMO_ROUTE: TransportRoute = {
  id: 'route-1',
  name: 'Route 12 - Kankarbagh',
  vehicle_number: 'BR01 PA 1234',
  driver_name: 'Rajesh Kumar',
  driver_phone: '+919876543210',
  conductor_name: 'Sunil Yadav',
  conductor_phone: '+919876543211',
  incharge_name: 'Meera Sharma (Transport Head)',
  incharge_phone: '+919876543212',
}

export const DEMO_STOPS: TransportStop[] = [
  { id: 'stop-1', route_id: 'route-1', stop_name: 'Kankarbagh Colony (Pickup)', scheduled_time: '07:15', latitude: 25.5941, longitude: 85.1376 },
  { id: 'stop-2', route_id: 'route-1', stop_name: 'Rajendra Nagar', scheduled_time: '07:30', latitude: 25.6022, longitude: 85.1506 },
  { id: 'stop-3', route_id: 'route-1', stop_name: 'School Campus (Drop)', scheduled_time: '07:45', latitude: 25.6111, longitude: 85.1396 },
]

export function getLocalTransportData() {
  return { route: DEMO_ROUTE, stops: DEMO_STOPS }
}
