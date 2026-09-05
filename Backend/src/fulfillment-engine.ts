export type WarehouseStock = {
  warehouseId: number;
  warehouseName: string;
  availableQuantity: number;
};

export type Allocation = {
  warehouseId: number;
  warehouseName: string;
  quantity: number;
};

export type FulfillmentResult = {
  requestedQuantity: number;
  allocatedQuantity: number;
  shortageQuantity: number;
  allocations: Allocation[];
  status: "FULFILLED" | "PARTIALLY_FULFILLED" | "BACKORDERED";
};

export function allocateInventory(requestedQuantity: number, warehouses: WarehouseStock[]): FulfillmentResult {
  let remaining = requestedQuantity;
  const allocations: Allocation[] = [];

  for (const warehouse of warehouses) {
    if (remaining <= 0) break;
    const quantity = Math.min(remaining, warehouse.availableQuantity);
    if (quantity > 0) {
      allocations.push({ warehouseId: warehouse.warehouseId, warehouseName: warehouse.warehouseName, quantity });
      remaining -= quantity;
    }
  }

  const allocatedQuantity = requestedQuantity - remaining;
  const status = remaining === 0 ? "FULFILLED" : allocatedQuantity > 0 ? "PARTIALLY_FULFILLED" : "BACKORDERED";
  return { requestedQuantity, allocatedQuantity, shortageQuantity: remaining, allocations, status };
}