export type Role = 'ADMIN' | 'PRODUCER'
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'LOCKED'
export type DeviceType =
  | 'FLOW_SENSOR_INLET'
  | 'FLOW_SENSOR_OUTLET'
  | 'SHUTOFF_VALVE'
  | 'CAMERA'
  | 'LOCALIZED_ACTUATOR'
  | 'EDGE_GATEWAY'
export type ValveState = 'OPEN' | 'CLOSING' | 'CLOSED' | 'OPENING' | 'UNKNOWN' | 'LOCKED'
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL'
export type AlertType = 'FLOW_ANOMALY' | 'PEST_DETECTION' | 'DEVICE_OFFLINE' | 'SAFETY_LOCKOUT'
export type FlowEvaluationStatus =
  | 'NORMAL'
  | 'POTENTIAL_ANOMALY'
  | 'CONFIRMED_ANOMALY'
  | 'NO_INFLOW'
  | 'SENSOR_INCONSISTENCY'
export type CommandType = 'CLOSE_VALVE' | 'OPEN_VALVE' | 'LOCALIZED_CONTROL'
export type CommandStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'EXECUTING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REJECTED'
  | 'EXPIRED'

export interface User {
  id: string
  email: string
  fullName: string
  role: Role
  active: boolean
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresAt: string
  user: User
}

export interface Farm {
  id: string
  name: string
  location: string | null
  ownerId: string
  ownerName: string
  createdAt: string
}

export interface Plot {
  id: string
  name: string
  cropType: string | null
  farmId: string
  farmName: string
  createdAt: string
}

export interface Device {
  id: string
  deviceCode: string
  name: string
  type: DeviceType
  status: DeviceStatus
  lastSeenAt: string | null
  plotId: string
}

export interface IrrigationSegment {
  id: string
  name: string
  plotId: string
  plotName: string
  inletSensorId: string
  inletSensorCode: string
  outletSensorId: string
  outletSensorCode: string
  shutoffValveId: string
  shutoffValveCode: string
  lossThresholdPercent: number
  persistenceSeconds: number
  automaticClosureEnabled: boolean
  valveState: ValveState
  anomalySince: string | null
  createdAt: string
}

export interface FlowTelemetry {
  id: string
  deviceMessageId: string
  segmentId: string
  inletFlowLitersPerMinute: number
  outletFlowLitersPerMinute: number
  lossPercentage: number | null
  evaluationStatus: FlowEvaluationStatus
  recordedAt: string
  duplicate: boolean
}

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  status: AlertStatus
  title: string
  message: string
  segmentId: string
  segmentName: string
  acknowledgedBy: string | null
  acknowledgedAt: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  resolutionNote: string | null
  createdAt: string
}

export interface ActuationCommand {
  id: string
  commandId: string
  type: CommandType
  status: CommandStatus
  segmentId: string
  segmentName: string
  valveDeviceCode: string
  requestedBy: string
  reason: string
  inspectionNote: string | null
  requestedAt: string
  expiresAt: string
  executedAt: string | null
  resultMessage: string | null
}

export interface DashboardSummary {
  farmCount: number
  plotCount: number
  irrigationSegmentCount: number
  onlineDeviceCount: number
  openAlertCount: number
  latestAlerts: Alert[]
}

export interface FarmBundle {
  farm: Farm
  plots: Array<Plot & { devices: Device[] }>
}

export interface VisionObservation {
  id: string
  pest: string
  scientificName: string
  confidence: number
  cameraCode: string
  plotName: string
  detectedAt: string
  status: 'PENDING' | 'CONFIRMED' | 'DISMISSED'
  action: 'NONE' | 'REVIEW' | 'LOCALIZED_RESPONSE'
  accent: 'amber' | 'red' | 'green'
}

export interface ApiProblem {
  title?: string
  detail?: string
  status?: number
  errors?: Record<string, string>
}
