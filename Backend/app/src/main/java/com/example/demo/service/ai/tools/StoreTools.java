package com.example.demo.service.ai.tools;

import java.util.List;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

import com.example.demo.model.projection.City.CityInfo;
import com.example.demo.repository.CityRepository;
import com.example.demo.repository.StoreRepository;

@Service
public class StoreTools {
    private final StoreRepository storesRepository;
    private final CityRepository cityRepository;

    public StoreTools(StoreRepository storesRepository, CityRepository cityRepository){
        this.storesRepository = storesRepository;
        this.cityRepository = cityRepository;
    }

    // @GetMapping("/stores")
    // public List<String> getStores(@RequestParam(defaultValue = "68134") String city) {
    //     return storesRepository.findStoreNames(city);
    // }

    // @GetMapping("/stores/locations")
    // public List<String> getStoreLocations(@RequestParam(defaultValue = "68134") String city,@RequestParam String store){
    //     return storesRepository.findStoreLocations(city, store);
    // }

    // @GetMapping("/cities")
    // public List<String> getCities(){
    //     return storesRepository.findAllCityNames();
    // }

    @Tool(description = "Get all available stores in a city. Use this when the user asks what stores are available, or when you need a valid store name before filtering products by store. Call getCities() first to get the correct ekatte code if the user mentions a city by name.")
    public List<String> getStores(
        @ToolParam(description = "City ekatte code. Defaults to 68134 (Sofia) if not specified.", required = false) String city
    ){
        return storesRepository.findStoreNames(city);
    }

    @Tool(description = "Get all branch locations for a specific store in a city. Use this when the user asks about specific store branches or locations, or when you need a valid storeLocation before filtering products. Call getCities() first to get the correct ekatte code if the user mentions a city by name.")
    public List<String> getStoreLocations(
        @ToolParam(description = "City ekatte code. Defaults to 68134 (Sofia) if not specified.", required = false) String city,
        @ToolParam(description = "Store name to get locations for, e.g. 'Kaufland', 'Билла'. Must be a valid store name — call getStores first if unsure.") String store
    ){
        return storesRepository.findStoreLocations(city, store);
    }

    @Tool(description = "Get all available cities with their ekatte codes. Use this when the user mentions a city by name so you can get the correct ekatte code to use in other tools.")
    public List<CityInfo> getCities(){
        return cityRepository.findAllCities();
    }
}
