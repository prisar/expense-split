import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public slideConfig = {
    infinity: true,
    autoplay: true,
    arrows: false,
    dots: true,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  public loginForm: FormGroup;
  public txtError = '';
  public sliderData: any[];

  constructor(
    private authSvc: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private dropSvc: DropdownService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // this.dropSvc.getSlider().subscribe(
    //   res => {
    //     this.sliderData = res;
    //   }
    // );
  }

  /**
   * login
   */
  login() {
    if (this.loginForm.valid) {
      const userInfo = {
        email: this.loginForm.controls.email.value,
        password: this.loginForm.controls.password.value
      };
      this.authSvc.authentication(userInfo).subscribe(
        res => {
          window.localStorage.setItem('access_token', res.token);
          if (this.authSvc.getRoleUser() === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/user/dashboard']);
          }
        },
        err => {
          this.txtError = err.error;
        }
      );
    }
  }

}
