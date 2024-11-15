export interface IProduct {
    name: string,
    price: number,
    description: string,
    images: Array<string>,
    product_type: 'New' | 'Used',
    status?: 'Active' | 'Deactive'
}