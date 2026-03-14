package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Repository.HangHoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class HangHoaController {
    @Autowired
    private HangHoaRepository hangHoaRepository;

    @GetMapping
    public List<HangHoa> getAll(){
        return hangHoaRepository.findAll();
    }
    @GetMapping("/warning")
    public List<HangHoa> getWarningProducts(){
        return hangHoaRepository.findBySoLuongTonLessThan(20);
    }
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public HangHoa create(@RequestBody HangHoa hangHoa){
        return hangHoaRepository.save(hangHoa);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public HangHoa update(@PathVariable String id, @RequestBody HangHoa hangHoaMoi){
        return hangHoaRepository.findById(id)
                .map(hangHoa ->{
                    hangHoa.setMaHang(hangHoaMoi.getMaHang());
                    hangHoa.setTenHang(hangHoaMoi.getTenHang());
                    hangHoa.setSoLuongTon(hangHoaMoi.getSoLuongTon());
                    hangHoa.setGiaNhap(hangHoaMoi.getGiaNhap());
                    hangHoa.setDonViTinh(hangHoaMoi.getDonViTinh());
                    hangHoa.setSoLuongToiThieu(hangHoaMoi.getSoLuongToiThieu());
                    return hangHoaRepository.save(hangHoa);


                })
                .orElseThrow(()-> new RuntimeException("không tìm thấy hàng hóa:"+ id ));

    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void delete(@PathVariable String id){
        hangHoaRepository.deleteById(id);
    }
}
