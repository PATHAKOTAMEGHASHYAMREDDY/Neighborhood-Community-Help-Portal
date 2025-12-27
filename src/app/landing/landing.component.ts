import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import lottie, { AnimationItem } from 'lottie-web';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lottieContainer') lottieContainer!: ElementRef;
  private animation: AnimationItem | null = null;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.loadAnimation();
    }, 0);
  }

  ngOnDestroy() {
    if (this.animation) {
      this.animation.destroy();
    }
  }

  loadAnimation() {
    if (this.lottieContainer && this.lottieContainer.nativeElement) {
      this.animation = lottie.loadAnimation({
        container: this.lottieContainer.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/Community_services.json'
      });
    }
  }

  navigateToAuth() {
    this.router.navigate(['/register']);
  }
}
