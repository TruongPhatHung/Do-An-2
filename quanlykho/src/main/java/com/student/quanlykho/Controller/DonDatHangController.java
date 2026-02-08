package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.ChiTietDonDatHang;
import com.student.quanlykho.Entity.DonDatHang;
import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.NhaCungCap;
import com.student.quanlykho.Repository.DonDatHangRepository;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.NhaCungCapRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class DonDatHangController {
    @Autowired
    private DonDatHangRepository donDatHangRepository;

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;

    @Autowired
    private HangHoaRepository hangHoaRepository;


    @GetMapping
    public List<DonDatHang> getAll(){
        return donDatHangRepository.findAll();
    }

    @GetMapping("/importable")
    public List<DonDatHang> getOrdersToImport(){
        return donDatHangRepository.findByTrangThaiIn(List.of("Mới Tạo", "Giao Thiếu"));

    }

    @PostMapping
    public DonDatHang create(@RequestBody DonHangRequest request){
        DonDatHang donDatHang  = new DonDatHang();
        donDatHang.setMaDon(request.getMaDon());
        donDatHang.setTrangThai("Mới Tạo");

        NhaCungCap nhaCungCap = nhaCungCapRepository.findById(request.getNhaCungCap().getMaNCC())
                .orElseThrow(()-> new RuntimeException("Không tìm thấy Nhà cung cấp"));
        donDatHang.setNhaCungCap(nhaCungCap);

        List<ChiTietDonDatHang> chiTietDonDatHangs = request.getChiTiets().stream().map(item ->{
            ChiTietDonDatHang chiTietDonDatHang = new ChiTietDonDatHang();
            chiTietDonDatHang.setDonDatHang(donDatHang);

            HangHoa hangHoa =  hangHoaRepository.findById(item.getHangHoa().getMaHang())
                    .orElseThrow(()-> new RuntimeException("Không tìm thấy hàng hóa:" + item.getHangHoa().getMaHang()));
            chiTietDonDatHang.setHangHoa(hangHoa);
            chiTietDonDatHang.setSoLuongDat(item.getSoLuongDat());
            chiTietDonDatHang.setDonGia(item.getDonGia());
            chiTietDonDatHang.setSoLuongDaNhap(0);
            return chiTietDonDatHang;


        }).collect(Collectors.toList());
        donDatHang.setChiTiets(chiTietDonDatHangs);
        return donDatHangRepository.save(donDatHang);
    }
    // --- Class phụ (DTO) để nhận dữ liệu JSON từ React gửi lên ---
    public static class DonHangRequest {
        private String maDon;
        private NhaCungCapRequest nhaCungCap;
        private List<ChiTietRequest> chiTiets;

        public String getMaDon() {
            return maDon;
        }

        public NhaCungCapRequest getNhaCungCap() {
            return nhaCungCap;
        }

        public List<ChiTietRequest> getChiTiets() {
            return chiTiets;
        }

        public void setMaDon(String maDon) {
            this.maDon = maDon;
        }

        public void setNhaCungCap(NhaCungCapRequest nhaCungCap) {
            this.nhaCungCap = nhaCungCap;
        }

        public void setChiTiets(List<ChiTietRequest> chiTiets) {
            this.chiTiets = chiTiets;
        }
    }
    public static class NhaCungCapRequest {
        private String maNCC;

        public String getMaNCC() {
            return maNCC;
        }

        public void setMaNCC(String maNCC) {
            this.maNCC = maNCC;
        }
    }
    public static class ChiTietRequest {
        private HangHoaRequest hangHoa;
        private int soLuongDat;
        private Double donGia;

        public HangHoaRequest getHangHoa() {
            return hangHoa;
        }

        public void setHangHoa(HangHoaRequest hangHoa) {
            this.hangHoa = hangHoa;
        }

        public int getSoLuongDat() {
            return soLuongDat;
        }

        public void setSoLuongDat(int soLuongDat) {
            this.soLuongDat = soLuongDat;
        }

        public Double getDonGia() {
            return donGia;
        }

        public void setDonGia(Double donGia) {
            this.donGia = donGia;
        }
    }
    public static class HangHoaRequest {
        private String maHang;

        public String getMaHang() {
            return maHang;
        }

        public void setMaHang(String maHang) {
            this.maHang = maHang;
        }
    }



}
