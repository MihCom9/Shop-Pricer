package com.example.demo.controllers.Stores;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.data.repository.StoresRepository;
import com.example.demo.model.City.CityInfo;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class StoresController {
    private final StoresRepository storesRepository;
    @Autowired
    public StoresController(StoresRepository storesRepository){
        this.storesRepository = storesRepository;
    }

    @GetMapping("/stores/count")
    public long getStoreCount(){
        return storesRepository.countStores();
    }

    @GetMapping("/stores")
    public List<String> getStores(@RequestParam(defaultValue = "68134") String city) {
        return storesRepository.findStoreNames(city);
    }

    @GetMapping("/stores/locations")
    public List<String> getStoreLocations(@RequestParam(defaultValue = "68134") String city,@RequestParam String store){
        return storesRepository.findStoreLocations(city, store);
    }

    @GetMapping("/cities")
    public List<String> getCities(){
        return storesRepository.findAllCityNames();
    }

    @GetMapping("/cities-full")
    public List<CityInfo> getCitiesFull(){
        return storesRepository.findAllCities();
    }
    
    @GetMapping("/cities/count")
    public int getCitiesCount(){
        return storesRepository.getCitiesCount();
    }
}
