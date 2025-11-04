import axiosClient from '@/utils/axios'

export const farmerService = {
  async getFarmers(params?: any) {
    const { data } = await axiosClient.get('/api/farmers/', { params })
    return data
  },

  async getFarmer(farmerId: string) {
    const { data } = await axiosClient.get(`/api/farmers/${farmerId}`)
    return data
  },

  async createFarmer(farmerData: any) {
    const { data } = await axiosClient.post('/api/farmers/', farmerData)
    return data
  },

  async uploadPhoto(farmerId: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await axiosClient.post(
      `/api/farmers/${farmerId}/upload-photo`, 
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },

  async generateIDCard(farmerId: string) {
    const { data } = await axiosClient.post(`/api/farmers/${farmerId}/generate-idcard`)
    return data
  },

  async downloadIDCard(farmerId: string) {
    const response = await axiosClient.get(
      `/api/farmers/${farmerId}/download-idcard`,
      { responseType: 'blob' }
    )
    return response.data
  },

  async verifyQR(qrData: string) {
    const { data } = await axiosClient.post('/api/farmers/verify-qr', { 
      qr_data: qrData 
    })
    return data
  },
}
