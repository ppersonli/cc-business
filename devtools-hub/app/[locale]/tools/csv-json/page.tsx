import { generateToolMetadata } from '@/lib/metadata'
import Client from './client'

export const metadata = generateToolMetadata('csv-json')

export default function CSVJSONPage() {
  return <Client />
}
