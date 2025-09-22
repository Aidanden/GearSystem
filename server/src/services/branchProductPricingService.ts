import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateBranchProductPricingData {
  branchId: string;
  productId: string;
  transferPrice: number;
  retailPrice: number;
  wholesalePrice?: number;
  effectiveDate?: Date;
}

export interface UpdateBranchProductPricingData {
  transferPrice?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  isActive?: boolean;
  effectiveDate?: Date;
}

export interface BranchProductPricingWithDetails {
  id: string;
  branchId: string;
  productId: string;
  transferPrice: number;
  retailPrice: number;
  wholesalePrice?: number;
  isActive: boolean;
  effectiveDate: Date;
  createdAt: Date;
  updatedAt: Date;
  branch: {
    id: string;
    code: string;
    name: string;
  };
  product: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
}

export class BranchProductPricingService {
  // إحضار جميع أسعار المحلات
  async getAllBranchProductPricing(): Promise<BranchProductPricingWithDetails[]> {
    return await prisma.branchProductPrice.findMany({
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as any;
  }

  // إحضار أسعار محل معين
  async getBranchPricing(branchId: string): Promise<BranchProductPricingWithDetails[]> {
    return await prisma.branchProductPrice.findMany({
      where: {
        branchId,
        isActive: true
      },
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true
          }
        }
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    }) as any;
  }

  // إحضار أسعار منتج معين في جميع المحلات
  async getProductPricingInBranches(productId: string): Promise<BranchProductPricingWithDetails[]> {
    return await prisma.branchProductPrice.findMany({
      where: {
        productId,
        isActive: true
      },
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true
          }
        }
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    }) as any;
  }

  // إحضار سعر منتج في محل معين
  async getBranchProductPrice(branchId: string, productId: string): Promise<BranchProductPricingWithDetails | null> {
    return await prisma.branchProductPrice.findUnique({
      where: {
        branchId_productId: {
          branchId,
          productId
        }
      },
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true
          }
        }
      }
    }) as any;
  }

  // إنشاء أو تحديث سعر منتج في محل
  async setBranchProductPrice(data: CreateBranchProductPricingData): Promise<BranchProductPricingWithDetails> {
    // التحقق من وجود المحل
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId }
    });
    if (!branch) {
      throw new Error('المحل غير موجود');
    }

    // التحقق من وجود المنتج
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });
    if (!product) {
      throw new Error('المنتج غير موجود');
    }

    // إنشاء أو تحديث السعر
    const pricing = await prisma.branchProductPrice.upsert({
      where: {
        branchId_productId: {
          branchId: data.branchId,
          productId: data.productId
        }
      },
      update: {
        transferPrice: data.transferPrice,
        retailPrice: data.retailPrice,
        wholesalePrice: data.wholesalePrice,
        effectiveDate: data.effectiveDate || new Date(),
        isActive: true
      },
      create: {
        branchId: data.branchId,
        productId: data.productId,
        transferPrice: data.transferPrice,
        retailPrice: data.retailPrice,
        wholesalePrice: data.wholesalePrice,
        effectiveDate: data.effectiveDate || new Date(),
        isActive: true
      },
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true
          }
        }
      }
    });

    return pricing as any;
  }

  // تحديث سعر موجود
  async updateBranchProductPrice(id: string, data: UpdateBranchProductPricingData): Promise<BranchProductPricingWithDetails> {
    return await prisma.branchProductPrice.update({
      where: { id },
      data,
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true
          }
        }
      }
    }) as any;
  }

  // حذف سعر (تعطيل)
  async deleteBranchProductPrice(id: string): Promise<void> {
    await prisma.branchProductPrice.update({
      where: { id },
      data: {
        isActive: false
      }
    });
  }

  // البحث في أسعار المحلات
  async searchBranchProductPricing(query: string): Promise<BranchProductPricingWithDetails[]> {
    return await prisma.branchProductPrice.findMany({
      where: {
        isActive: true,
        OR: [
          {
            branch: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            branch: {
              code: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            product: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            product: {
              code: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        branch: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            unit: true
          }
        }
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    }) as any;
  }
}
