// frontend/src/services/farmer.service.ts - COMPLETE VERSION
import axiosClient from "@/utils/axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const farmerService = {
  /**
   * Fetch a paginated list of farmers.
   * Backend: GET /api/farmers?limit=10&skip=0
   */
  async getFarmers(limit = 50, skip = 0) {
    const { data } = await axiosClient.get("/farmers/", {
      params: { limit, skip },
    });
    return data;
  },

  /**
   * Alias for getFarmers (backward compatibility)
   */
  async list(skip = 0, limit = 50) {
    return this.getFarmers(limit, skip);
  },

  /**
   * Get a single farmer's details.
   * Backend: GET /api/farmers/{farmer_id}
   */
  async getFarmer(farmerId: string) {
    if (!farmerId) throw new Error("Missing farmerId");
    const { data } = await axiosClient.get(`/farmers/${farmerId}`);
    return data;
  },

  /**
   * Alias for getFarmer (backward compatibility)
   */
  async getById(farmerId: string) {
    return this.getFarmer(farmerId);
  },

  /**
   * Create a new farmer record.
   * Backend: POST /api/farmers/
   */
  async create(farmerData: Record<string, any>) {
    if (!farmerData) throw new Error("Missing farmer data");
    const { data } = await axiosClient.post("/farmers/", farmerData);
    return data;
  },

  /**
   * Update an existing farmer.
   * Backend: PUT /api/farmers/{farmer_id}
   */
  async updateFarmer(farmerId: string, farmerData: any) {
    if (!farmerId) throw new Error("Missing farmerId");
    const { data } = await axiosClient.put(`/farmers/${farmerId}`, farmerData);
    return data;
  },

  /**
   * Alias for updateFarmer
   */
  async update(farmerId: string, farmerData: any) {
    return this.updateFarmer(farmerId, farmerData);
  },

  /**
   * Delete an existing farmer.
   * Backend: DELETE /api/farmers/{farmer_id}
   */
  async deleteFarmer(farmerId: string) {
    if (!farmerId) throw new Error("Missing farmerId");
    const { data } = await axiosClient.delete(`/farmers/${farmerId}`);
    return data;
  },

  /**
   * Alias for deleteFarmer
   */
  async delete(farmerId: string) {
    return this.deleteFarmer(farmerId);
  },

  // ============================================
  // 📸 PHOTO UPLOAD
  // ============================================

  /**
   * Upload a farmer's photo.
   * Backend: POST /api/farmers/{farmer_id}/upload-photo
   */
  async uploadPhoto(farmerId: string, file: File) {
    if (!file) throw new Error("Missing file for upload");
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error("Please select an image file (JPG, PNG)");
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB");
    }

    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosClient.post(
      `/farmers/${farmerId}/upload-photo`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  // ============================================
  // 📄 DOCUMENT UPLOADS
  // ============================================

  /**
   * Upload farmer document (NRC, Land Title, License, Certificate, etc.)
   * Backend: POST /api/farmers/{farmer_id}/upload-document?document_type={type}
   */
  async uploadDocument(
    farmerId: string, 
    documentType: 'nrc' | 'land_title' | 'license' | 'certificate' | 'other',
    file: File
  ) {
    if (!file) throw new Error("Missing file for upload");
    if (!documentType) throw new Error("Missing document type");
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size must be less than 10MB");
    }

    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosClient.post(
      `/farmers/${farmerId}/upload-document?document_type=${documentType}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  /**
   * Legacy method - Upload farmer ID document (NRC)
   */
  async uploadIDDocument(farmerId: string, file: File) {
    return this.uploadDocument(farmerId, 'nrc', file);
  },

  /**
   * Get all files for a farmer
   * Backend: GET /api/farmers/{farmer_id}/files
   */
  async getFiles(farmerId: string) {
    if (!farmerId) throw new Error("Missing farmerId");
    const { data } = await axiosClient.get(`/farmers/${farmerId}/files`);
    return data;
  },

  /**
   * Delete farmer photo
   * Backend: DELETE /api/farmers/{farmer_id}/delete-photo
   */
  async deletePhoto(farmerId: string) {
    if (!farmerId) throw new Error("Missing farmerId");
    const { data } = await axiosClient.delete(`/farmers/${farmerId}/delete-photo`);
    return data;
  },

  /**
   * Delete specific document
   * Backend: DELETE /api/farmers/{farmer_id}/delete-document/{doc_type}
   */
  async deleteDocument(farmerId: string, docType: string) {
    if (!farmerId || !docType) throw new Error("Missing farmerId or docType");
    const { data } = await axiosClient.delete(
      `/farmers/${farmerId}/delete-document/${docType}`
    );
    return data;
  },

  // ============================================
  // 🆔 ID CARD GENERATION
  // ============================================

  /**
   * Trigger background ID-card generation.
   * Backend: POST /api/farmers/{farmer_id}/generate-idcard
   */
  async generateIDCard(farmerId: string) {
    if (!farmerId) throw new Error("Missing farmerId");
    const { data } = await axiosClient.post(
      `/farmers/${farmerId}/generate-idcard`
    );
    return data;
  },

  /**
   * Download an existing farmer ID card (PDF blob).
   * Backend: GET /api/farmers/{farmer_id}/download-idcard
   */
  async downloadIDCard(farmerId: string) {
    if (!farmerId) throw new Error("Missing farmerId");
    
    const response = await axiosClient.get(
      `/farmers/${farmerId}/download-idcard`,
      { responseType: "blob" }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${farmerId}_id_card.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  // ============================================
  // 🔍 QR CODE
  // ============================================

  /**
   * Get QR code image for farmer
   * Backend: GET /api/farmers/{farmer_id}/qr
   */
  async getQRCode(farmerId: string) {
    if (!farmerId) throw new Error("Missing farmerId");
    // Returns image URL that can be used in <img> tag
    return `${API_BASE}/api/farmers/${farmerId}/qr`;
  },

  /**
   * Verify a QR code payload.
   * Backend expects: { farmer_id, timestamp, signature }
   */
  async verifyQR(payload: {
    farmer_id: string;
    timestamp: string;
    signature: string;
  }) {
    if (!payload?.farmer_id || !payload?.timestamp || !payload?.signature) {
      throw new Error("Invalid QR payload");
    }
    const { data } = await axiosClient.post("/farmers/verify-qr", payload);
    return data;
  },

  // ============================================
  // 📊 STATISTICS & SEARCH
  // ============================================

  /**
   * Get farmer statistics
   * Backend: GET /api/farmers/stats
   */
  async getStats() {
    const { data } = await axiosClient.get("/farmers/stats");
    return data;
  },

  /**
   * Search farmers by various criteria
   * Backend: GET /api/farmers/search
   */
  async search(params: {
    query?: string;
    province?: string;
    district?: string;
    status?: string;
  }) {
    const { data } = await axiosClient.get("/farmers/search", { params });
    return data;
  },
};

export default farmerService;