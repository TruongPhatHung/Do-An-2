package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.PhieuXuat;
import com.student.quanlykho.Repository.DonDatHangRepository;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.PhieuXuatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/thong-ke")
@CrossOrigin(origins = "*")
public class ThongKeController {
    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private DonDatHangRepository donDatHangRepository;

    @Autowired
    private PhieuXuatRepository phieuXuatRepository;

    // API lấy dữ liệu tổng hợp cho Dashboard
    @GetMapping("/tong-quan")
    public Map<String, Object> getThongKeTongQuan() {
        Map<String, Object> result = new HashMap<>();

        // --- PHẦN 1: CÁC CON SỐ TỔNG QUAN ---
        result.put("tongSoMatHang", hangHoaRepository.count());

        Long tongHangTon = hangHoaRepository.tinhTongHangTonKho();
        result.put("tongHangTon", tongHangTon != null ? tongHangTon : 0);

        result.put("tongDonHang", donDatHangRepository.count());
        result.put("tongPhieuXuat", phieuXuatRepository.count());

        // --- PHẦN 2: DỮ LIỆU CHI TIẾT (NÂNG CẤP) ---
        List<HangHoa> tatCaHang = hangHoaRepository.findAll();

        // 1. Lọc ra danh sách chi tiết các mặt hàng cần cảnh báo
        List<HangHoa> danhSachCanhBao = tatCaHang.stream()
                .filter(hangHoa -> hangHoa.getSoLuongTon() < hangHoa.getSoLuongToiThieu())
                .collect(Collectors.toList());

        result.put("soHangCanhBao", danhSachCanhBao.size()); // Vẫn giữ con số đếm
        result.put("danhSachCanhBao", danhSachCanhBao);      // Cấp luôn danh sách mảng cho Frontend vẽ bảng

        // 2. Lấy 5 hoạt động xuất kho mới nhất
        List<PhieuXuat> xuatKhoGanDay = phieuXuatRepository.findTop5ByOrderByNgayXuatDesc();
        result.put("hoatDongXuatKhoMoiNhat", xuatKhoGanDay);

        return result;
    }
}
