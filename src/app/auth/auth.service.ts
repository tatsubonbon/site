import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";


export interface AuthReponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registerd?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private tokenExpirationTimer: any;
    user = new BehaviorSubject<User>(null);

    constructor(private http: HttpClient, private router: Router) { }


    signUp(email: string, password: string) {
        return this.http.post<AuthReponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBKSSETVFlckIh2BrlhE0OzuXYlxIrKU5Y',
            { email: email, password: password, returnSecureToken: true })
            .pipe(
                catchError(this.handleError), tap(resData => {
                    this.handleAuthentification(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
                })
            )
    }

    login(email: string, password: string) {
        return this.http.post<AuthReponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBKSSETVFlckIh2BrlhE0OzuXYlxIrKU5Y',
            { email: email, password: password, returnSecureToken: true }).pipe(
                catchError(this.handleError), tap(resData => {
                    this.handleAuthentification(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
                })
            )
    }

    autoLogin() {
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            return;
        }
        const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

        if (loadedUser.token) {
            this.user.next(loadedUser);
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    }

    logout() {
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occured';
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage);
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_NOT_EXISTS':
                errorMessage = 'This email exists already'
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'This email does not exist';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'This password is not correct';
                break;
            case 'USER_DISABLED':
                errorMessage = 'This user is disabled';
                break;
        }
        return throwError(errorMessage);
    }

    private handleAuthentification(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(email, userId, token, expirationDate);
        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }
}