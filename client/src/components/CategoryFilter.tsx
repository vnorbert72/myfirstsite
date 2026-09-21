import { Button } from "@/components/ui/button";
import { categories } from "@shared/articles";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          data-testid={`button-category-${category.toLowerCase()}`}
        >
          {category === "all" ? "All Articles" : category}
        </Button>
      ))}
    </div>
  );
}
