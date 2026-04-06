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
    private String maYeuCau;

    @ManyToOne
    @JoinColumn(name = "nha_cung_cap_id", nullable = false)
    private NhaCungCap nhaCungCap;

    // 🎯 ĐỔI TÊN THÀNH nguoiTao ĐỂ ĐỒNG BỘ TOÀN HỆ THỐNG
    @Column(name = "nguoi_tao", length = 50)
    private String nguoiTao;

    @Column(name = "ngay_yeu_cau")
    private LocalDateTime ngayYeuCau;

    @Column(name = "trang_thai", nullable = false)
    private String trangThai;

    @Column(name = "ly_do_tu_choi", columnDefinition = "TEXT")
    private String lyDoTuChoi;

    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @OneToMany(mappedBy = "yeuCauMuaHang", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ChiTietYeuCauMua> chiTiets;

    @PrePersist
    protected void onCreate() {
        this.ngayYeuCau = LocalDateTime.now();
        if (this.trangThai == null) {
            this.trangThai = "Chờ Duyệt";
        }
    }
}