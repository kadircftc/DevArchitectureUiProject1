import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/lookUp.service';
import { SharedService } from 'app/core/services/shared.service';
import { Subscription } from 'rxjs';
import { Product } from '../product/models/Product';
import { ProductService } from '../product/services/Product.service';
import { Storage } from '../storage/models/Storage';
import { StorageService } from '../storage/services/Storage.service';
import { User } from '../user/models/user';
import { UserService } from '../user/services/user.service';
import { Order } from './models/Order';
import { OrderService } from './services/Order.service';


declare var jQuery: any;

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss'],
	animations: [
		trigger('fadeInOut', [
		  state('void', style({ opacity: 0 })), 
		  transition('void <=> *', [
			animate(300) 
		  ]),
		]),
	  ],
})
export class OrderComponent implements AfterViewInit, OnInit {

	clickEventSubscription:Subscription;
	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id', 'productId', 'productQuantity', 'confirmation', 'productName','createdUserId','userName', 'createdDate', 'status', 'confirmationSet', 'update', 'delete'];

	orderList: Order[];
	order: Order = new Order();
	productList: Product[];
	orderAddForm: FormGroup;
	storageList: Storage[];
	confirmation: boolean = false;
	userId: string;
	userList:User[];
	showForm:boolean=false;


	orderId: number;

	constructor(private orderService: OrderService, private storageService: StorageService,private sharedService:SharedService, private lookupService: LookUpService, private productService: ProductService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService,private userService:UserService) { 



	}

	ngAfterViewInit(): void {
		this.getOrderList();
	}

	openUserInfo(){
		this.showForm=true;
	}
	closeUserInfo(){
		this.showForm=false;
	}



	ngOnInit() 
	{
		this.userService.getUserList().subscribe(data=>{
			this.userList=data;
		})

		this.productService.getProductList().subscribe(data => {
			this.productList = data;
		})
		this.storageService.getStorageList().subscribe(data => {
			this.storageList = data.filter(item => !item.isDeleted);
		})
		this.createOrderAddForm();
	}
	


	getUserName(id:number){
		const user=this.userList.find(item=>item.userId===id);
		if(user){
			return `${user.fullName}`;
		}
	}


	getUserDetail(id: number) {
		const user = this.userList.find(item => item.userId === id);
		if (user) {
		  const fullName = user.fullName || 'Bulunamadı';
		  const address = user.address || 'Bulunamadı';
		  const mobilePhones = user.mobilePhones || 'Bulunamadı';
		  const email = user.email || 'Bulunamadı';
	  
		  return `İsim: ${fullName} \n Adres: ${address}\n Telefon: ${mobilePhones}\n Email: ${email}`;
		}
	  }
	  

	getProductName(id: number): string {
		const product = this.productList.find(item => item.id === id);
		if (product) {
			return `Ürün Adı:${product.name}| Beden: ${product.size} Renk:${product.color}`;
		}
	}

	getOrderList() {

		this.orderService.getOrderList().subscribe(data => {

			this.orderList = data.filter(item => !item.isDeleted && item.confirmation == this.confirmation);
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
		});
	}

	filterConfirmationOrder() {
		if (this.confirmation == false) {
			this.confirmation = true;
		}
		else {
			this.confirmation = false;
		}
		this.getOrderList();
	}

	save() {
		if (this.orderAddForm.valid) {
			this.order = Object.assign({}, this.orderAddForm.value)

			if (this.order.id == 0)
				this.addOrder();
			else
				this.updateOrder();
		}

	}

	addOrder() {
		this.orderService.addOrder(this.order).subscribe(data => {
			this.getOrderList();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);

		})

	}

	updateOrder() {

		this.orderService.updateOrder(this.order).subscribe(data => {

			var index = this.orderList.findIndex(x => x.id == this.order.id);
			this.orderList[index] = this.order;
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);

		})

	}



	checkisReady(id: number) {

		const isReady = this.storageList.find(item => item.productId == id)
		if (isReady.isRSale == false)
			return false;
	}

	checkQuantity(id: number) {

		const storageQuantity = this.storageList.find(item => item.productId == id)
		const orderProductQuantity = this.orderList.find(item => item.productId == id)
		if (storageQuantity.quantity >= orderProductQuantity.productQuantity)
			return true;
	}



	setOrderConfirmation(id: number) {
		var index = this.orderList.findIndex(x => x.id === id);

		let sd = this.orderList.find(item => item.id === id);

		if (sd.confirmation === false) {
			sd.confirmation = true;
		} else {
			sd.confirmation = false;
		}

		this.orderList[index] = sd;

		this.orderService.updateOrder(sd).subscribe(data => {
			this.alertifyService.success(data);
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
			this.getOrderList();
		});


	}

	createOrderAddForm() {
		this.orderAddForm = this.formBuilder.group({
			id: [0],
			status: [false, Validators.required],
			isDeleted: [false, Validators.required],
			userId: [0, Validators.required],
			productId: [0, Validators.required],
			productQuantity: [0, Validators.required],
			confirmation: [false]
		})
	}

	deleteOrder(orderId: number) {
		this.orderService.deleteOrder(orderId).subscribe(data => {
			this.alertifyService.success(data.toString());
			this.orderList = this.orderList.filter(x => x.id != orderId);
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
		})
	}

	getOrderById(orderId: number) {
		this.clearFormGroup(this.orderAddForm);
		this.orderService.getOrderById(orderId).subscribe(data => {
			this.order = data;
			this.orderAddForm.patchValue(data);
		})
	}


	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id')
				group.get(key).setValue(0);
			if (key == 'status')
				group.get(key).setValue(true);
			if (key == 'isDeleted')
				group.get(key).setValue(false);
			if (key == 'userId')
				group.get(key).setValue(0);
			if (key == 'productId')
				group.get(key).setValue(0);
			if (key == 'productQuantity')
				group.get(key).setValue(0);
			if (key == 'confirmation')
				group.get(key).setValue(false);
		});
	}

	checkClaim(claim: string): boolean {
		return this.authService.claimGuard(claim)
	}

	configDataTable(): void {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

}
