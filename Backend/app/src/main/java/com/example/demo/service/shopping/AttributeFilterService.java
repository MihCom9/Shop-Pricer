package com.example.demo.service.shopping;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.request.common.BrandSelection;
import com.example.demo.repository.CategoryRepository;

@Service
public class AttributeFilterService {
    private final CategoryRepository categoryRepository;

    @Autowired
    public AttributeFilterService(CategoryRepository categoryRepository){
        this.categoryRepository = categoryRepository;
    }

    public List<String> getMeasurements(Long categoryId, List<BrandSelection> selections) {
        List<Integer> preferredIds = selections == null ? List.of() : selections.stream()
            .filter(s -> s.getState() == BrandSelection.State.PREFERRED)
            .map(BrandSelection::getBrandId)
            .toList();

        List<Integer> excludedIds = selections == null ? List.of() : selections.stream()
            .filter(s -> s.getState() == BrandSelection.State.EXCLUDED)
            .map(BrandSelection::getBrandId)
            .toList();
        
        Integer[] preferredArray = (preferredIds == null || preferredIds.isEmpty())
            ? null
            : preferredIds.toArray(new Integer[0]);

        Integer[] excludedArray = (excludedIds == null || excludedIds.isEmpty())
            ? null
            : excludedIds.toArray(new Integer[0]);

        List<String> raw = categoryRepository.findDistinctMeasurements(categoryId, preferredArray, excludedArray);
        return MeasurementNormalizer.deduplicateForDisplay(raw);
    }
}
