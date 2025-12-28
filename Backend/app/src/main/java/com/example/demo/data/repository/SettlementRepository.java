package com.example.demo.data.repository;

import java.util.List;
import org.springframework.data.repository.CrudRepository;
import com.example.demo.data.Settlement;

public interface SettlementRepository extends CrudRepository<Settlement, Long> {

    List<Settlement> findByName(String name);

    Settlement findById(long id);
}