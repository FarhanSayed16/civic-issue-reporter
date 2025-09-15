import { z } from "zod";

export const gigSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum([
    "web-development",
    "graphic-design",
    "writing-translation",
    "digital-marketing",
    "video-animation",
    "music-audio",
    "programming-tech",
    "business",
    "lifestyle",
  ]),
  tags: z.array(z.string()).optional(),
  price: z.number().min(0, "Price must be at least 0"),
  deliveryTime: z.number().min(1, "Delivery time must be at least 1 day"),

  packages: z
    .array(
      z.object({
        name: z.string().min(1, "Package name is required"),
        price: z.number().min(0, "Price must be at least 0"),
        features: z.array(z.string()).optional(),
        deliveryTime: z.number().min(1, "Delivery time must be at least 1 day"),
      })
    )
    .optional(),

  extras: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().min(0),
        description: z.string().optional(),
      })
    )
    .optional(),

  requirements: z
    .array(
      z.object({
        question: z.string().min(1).optional(),
      })
    )
    .optional(),

  images: z.array(z.instanceof(File)).min(1).optional(),
});
