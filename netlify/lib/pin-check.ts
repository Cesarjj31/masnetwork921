import { scryptSync, timingSafeEqual } from 'node:crypto'
export function checkPin(value:string){return timingSafeEqual(scryptSync(value,'mas-network-access-v1',64),Buffer.from('a32bacffc56702642224620b5cf252101f646c88ced89e9ceff5d42fae325aa41672825683978003fc54bde303b8f801a85fa6abd79c22a839aefa986f83e23c','hex'))}
