package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.PhieuNhap;
import com.student.quanlykho.Service.NhapKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RequestMapping("/api/phieu-nhap")
@CrossOrigin(origins = "*")
@RestController
public class PhieuNhapController {
    @Autowired
    private NhapKhoService nhapKhoService;
    // API Nhập kho: POST /api/phieu-nhap
    // Body mẫu: { "maDonHang": "PO-001", "chiTietNhap": { "SP001": 60, "SP002": 40 } }

    @PostMapping
    public PhieuNhap taoPhieuNhap(@RequestBody NhapKhoRequest nhapKhoRequest ){
        return nhapKhoService.taoPhieuNhap(nhapKhoRequest.maDonHang, nhapKhoRequest.chiTietNhap);
    }
    // Class phụ để hứng dữ liệu JSON
    public static class NhapKhoRequest{
        public String maDonHang;
        public Map<String, Integer> chiTietNhap;
    }
}
