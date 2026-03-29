package com.student.quanlykho.Entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "yeu_cau_mua_hang")
@Data
public class YeuCauMuaHang {

    @Id
    @Column(name = "ma_yeu_cau", length = 50)
    private String maYeuCau; // VD: YCM-123456

    // Quản lý kho đề xuất mua từ Nhà cung cấp nào
    @ManyToOne
    @JoinColumn(name = "nha_cung_cap_id", nullable = false)
    private NhaCungCap nhaCungCap;

    @Column(name = "nguoi_yeu_cau")
    private String nguoiYeuCau; // Tên nhân viên kho tạo phiếu

    @Column(name = "ngay_yeu_cau")
    private LocalDateTime ngayYeuCau;

    // Trạng thái: "Chờ Duyệt", "Đã Duyệt", "Từ Chối", "Đã Lên PO"
    @Column(name = "trang_thai", nullable = false)
    private String trangThai;

    @Column(name = "ly_do_tu_choi", columnDefinition = "TEXT")
    private String lyDoTuChoi; // Sếp ghi lý do vào đây nếu chê

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @OneToMany(mappedBy = "yeuCauMuaHang", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ChiTietYeuCauMua> chiTiets;

    @PrePersist
    protected void onCreate() {
        this.ngayYeuCau = LocalDateTime.now();
        if (this.trangThai == null) {
            this.trangThai = "Chờ Duyệt"; // Mặc định vừa tạo là Chờ Sếp Duyệt
        }
    }
}