package com.student.quanlykho.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileStatsDTO {
    private String thamNien; // Thâm niên (VD: "1 năm 2 tháng")
    private Map<String, Object> kpis; // Chứa các chỉ số động tùy theo Vai trò
    private List<LogDTO> lichSuHoatDong; // 10 hoạt động gần nhất

    // 🎯 Inner class cũng xài Lombok luôn cho nó cụt lủn!
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LogDTO {
        private String thoiGian;
        private String hanhDong;
        private String loai;
    }
}