package com.student.quanlykho.Controller;

import com.student.quanlykho.Entity.NhaCungCap;
import com.student.quanlykho.Repository.NhaCungCapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/suppliers")
@CrossOrigin(origins = "*")
public class NhaCungCapController {

    @Autowired
    private NhaCungCapRepository nhaCungCapRepository;


    @GetMapping
    public List<NhaCungCap> getAll(){
        return nhaCungCapRepository.findAll();
    }

    @PostMapping
    public NhaCungCap  create(@RequestBody NhaCungCap nhaCungCap){
        return nhaCungCapRepository.save(nhaCungCap);
    }
    @PutMapping("/{id}")
    public NhaCungCap update(@PathVariable String id, @RequestBody NhaCungCap nhaCungCapMoi){
        return nhaCungCapRepository.findById(id)
                .map(nhaCungCap -> {
                    nhaCungCap.setMaNCC(nhaCungCapMoi.getMaNCC());
                    nhaCungCap.setTemNCC(nhaCungCapMoi.getTemNCC());
                    nhaCungCap.setDiaChi(nhaCungCapMoi.getDiaChi());
                    return nhaCungCapRepository.save(nhaCungCap);

                })
                .orElseThrow(()-> new RuntimeException("Không tìm thấy nhà cung cấp:"+ id))

    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id){
        nhaCungCapRepository.deleteById(id);
    }
}
