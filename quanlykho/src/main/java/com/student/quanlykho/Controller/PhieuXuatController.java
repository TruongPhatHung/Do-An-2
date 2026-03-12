package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.PhieuXuat;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.PhieuXuatRepository;
import com.student.quanlykho.Service.XuatKhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/phieu-xuat")
public class PhieuXuatController {
    @Autowired
    private XuatKhoService xuatKhoService;

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private PhieuXuatRepository phieuXuatRepository;
    @PostMapping
    public PhieuXuat xuatkho(@RequestBody XuatKhoRequest request){
        return  xuatKhoService.taoPhieuXuat(request.lyDo, request.chiTietXuat);
    }

    @GetMapping("/canh-bao")
    public List<HangHoa> getHangCanhBao(){
        List<HangHoa> tatCaHang = hangHoaRepository.findAll();
        return tatCaHang.stream()
                .filter(hangHoa -> hangHoa.getSoLuongTon()< hangHoa.getSoLuongToiThieu())
                .collect(Collectors.toList());
    }
    @GetMapping("/xem-all")
    public List<PhieuXuat> getAllPhieuXuat() {
        return phieuXuatRepository.findAll();
    }
    public static class XuatKhoRequest{
        public String lyDo;
        public Map<String, Integer> chiTietXuat;
    }
}
