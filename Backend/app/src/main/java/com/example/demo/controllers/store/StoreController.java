package com.example.demo.controllers.store;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.projection.City.CityInfo;
import com.example.demo.repository.CityRepository;
import com.example.demo.repository.StoreRepository;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class StoreController {
    private final StoreRepository storesRepository;
    private final CityRepository cityRepository;

    @Autowired
    public StoreController(StoreRepository storesRepository, CityRepository cityRepository){
        this.storesRepository = storesRepository;
        this.cityRepository = cityRepository;
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
        return cityRepository.findAllCityNames();
    }

    @GetMapping("/cities-full")
    public List<CityInfo> getCitiesFull(){
        return cityRepository.findAllCities();
    }
    
    @GetMapping("/cities/count")
    public int getCitiesCount(){
        return cityRepository.getCitiesCount();
    }
}
