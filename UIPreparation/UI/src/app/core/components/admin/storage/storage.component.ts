import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/lookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Storage } from './models/Storage';
import { StorageService } from './services/Storage.service';
import { Product } from '../product/models/Product';
import { ProductService } from '../product/services/Product.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

declare var jQuery: any;

@Component({
	selector: 'app-storage',
	templateUrl: './storage.component.html',
	styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements AfterViewInit, OnInit {

	productName$: Observable<string>;

	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id', 'productId', 'quantity', 'isRSale', 'status', 'isDeleted','confirmationIsReady', 'update', 'delete'];

	storageList: Storage[];
	storage: Storage = new Storage();
	productList: Product[];
	product: Product[];
	filterIsReady:boolean=true;

	
	storageAddForm: FormGroup;

	productname: Product[];
	storageId: number;

	constructor(private storageService: StorageService, private productService: ProductService, private lookupService: LookUpService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService) { }

	ngAfterViewInit(): void {
		this.getStorageList();
	}

	ngOnInit() {
		this.productService.getProductList().subscribe(data => {
			this.productList = data.filter(item=>!item.isDeleted);
		})
		this.createStorageAddForm();
	}
	filterConfirmationOrder() {
		if (this.filterIsReady == false) {
			this.filterIsReady = true;
		}
		else {
			this.filterIsReady = false;
		}
		this.getStorageList();
	}
	

	getProductName(id: number): string {
		const product = this.productList.find(item => item.id === id);
		if (product) {
			return `${product.name}, Beden: ${product.size}, Renk: ${product.color}`;
		  }
	  }

	  setIsReady(id:number){
		var index = this.storageList.findIndex(x => x.id === id);

		let sd = this.storageList.find(item => item.id === id);

		if (sd.isRSale === false) {
			sd.isRSale = true;
		} else {
			sd.isRSale = false;
		}

		this.storageList[index] = sd;

		this.storageService.updateStorage(sd).subscribe(data => {
			this.alertifyService.success(data);
			this.dataSource = new MatTableDataSource(this.storageList);
			this.configDataTable();
			this.getStorageList();
		});
	  }

	  getStorageList() {
		this.storageService.getStorageList().subscribe(data => {
		  this.storageList = data.filter(item => !item.isDeleted&&item.isRSale===this.filterIsReady);
	  
		 
		  const validProductIds = this.productList.filter(product => !product.isDeleted).map(product => product.id);
	  
		 
		  this.storageList = this.storageList.filter(storage => validProductIds.includes(storage.productId));
	  
		  this.dataSource = new MatTableDataSource(this.storageList);
		  this.configDataTable();
		});
	  }

	save() {

		if (this.storageAddForm.valid) {
			this.storage = Object.assign({}, this.storageAddForm.value)

			if (this.storage.id == 0)
				this.addStorage();
			else
				this.updateStorage();
		}

	}

	addStorage() {

		this.storageService.addStorage(this.storage).subscribe(data => {
			this.getStorageList();
			this.storage = new Storage();
			jQuery('#storage').modal('hide');
			this.alertifyService.success(data);
		
			this.clearFormGroup(this.storageAddForm);

		})

	}

	updateStorage() {

		this.storageService.updateStorage(this.storage).subscribe(data => {

			var index = this.storageList.findIndex(x => x.id == this.storage.id);
			this.storageList[index] = this.storage;
			this.dataSource = new MatTableDataSource(this.storageList);
			this.configDataTable();
			this.storage = new Storage();
			jQuery('#storage').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.storageAddForm);

		})

	}

	createStorageAddForm() {
		this.storageAddForm = this.formBuilder.group({
			id: [0],
			status:[false],
			productId: [0, Validators.required],
			quantity: [0, Validators.required],
			isRSale: [false]

		})
	}

	deleteStorage(storageId: number) {
		this.storageService.deleteStorage(storageId).subscribe(data => {
			this.alertifyService.success(data.toString());
			this.storageList = this.storageList.filter(x => x.id != storageId);
			this.dataSource = new MatTableDataSource(this.storageList);
			this.configDataTable();
		})
	}

	getStorageById(storageId: number) {
		this.clearFormGroup(this.storageAddForm);
		this.storageService.getStorageById(storageId).subscribe(data => {
			this.storage = data;
			this.storageAddForm.patchValue(data);
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
			if (key == 'productId')
				group.get(key).setValue(0);
			if (key == 'quantity')
				group.get(key).setValue(0);
			if (key == 'isRSale')
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
