const taskType = {
  CALL_STATUS: 'call_status',
  HOLD_RESUME: 'hold_resume',
  UNATTENDED_TRANSFER: 'unattended_transfer'
}

const taskRepentance = {
  RECURRING_JOB: 'recurring_job',
  ONCE_OFF: 'once_off'
}

const userRole = {
  ADMIN: 'admin',
  WEBEX_ADMIN: 'webex_admin',
  WEBEX_USER: 'webex_user',
  PURECLOUD_ADMIN: 'purecloud_admin',
  PURECLOUD_USER: 'purecloud_user'
}

const deviceTypes = {
  'DX-70': 'DX-70',
  'DX-80': 'DX-80'
}

module.exports = {
  taskType,
  userRole,
  deviceTypes,
  taskRepentance
}
