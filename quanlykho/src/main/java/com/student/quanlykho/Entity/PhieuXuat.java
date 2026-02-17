package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "phieu_xuat")
public class PhieuXuat {
    @Id
    @Column(name = "ma_phieu_xuat")
    private String maPhieuXuat; // Ví dụ: PX-20260210

    @Column(name = "ngay_xuat")
    private LocalDateTime ngayXuat = LocalDateTime.now();

    @Column(name = "ly_do_xuat")
    private String lyDoXuat; // Ví dụ: "BanHang", "HuyHang", "NoiBo"

    @ManyToOne
    @JoinColumn(name = "ma_nd") // Nhân viên kho thực hiện xuất
    private NguoiDung nguoiDung;

    // Một phiếu xuất có nhiều chi tiết
    @OneToMany(mappedBy = "phieuXuat", cascade = CascadeType.ALL)
    private List<ChiTietPhieuXuat> chiTiets;
}
