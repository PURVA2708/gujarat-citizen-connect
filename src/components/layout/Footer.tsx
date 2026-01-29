import { Shield, Phone, Mail, MapPin } from 'lucide-react';
export function Footer() {
  return <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-secondary-foreground">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Smart Citizen Complaint</h3>
                <p className="text-sm text-background/70">Government of Gujarat</p>
              </div>
            </div>
            <p className="text-sm text-background/70 max-w-md">
              Empowering citizens to report civic issues and ensuring transparent, 
              efficient resolution through digital governance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="/" className="hover:text-secondary transition-colors">Home</a></li>
              <li><a href="/login" className="hover:text-secondary transition-colors">Register Complaint</a></li>
              <li><a href="/map" className="hover:text-secondary transition-colors">View Map</a></li>
              <li><a href="/about" className="hover:text-secondary transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1800-123-4567 (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@gujaratgov.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Sachivalaya, Gandhinagar, Gujarat - 382010</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm text-background/50">
          <p>© {new Date().getFullYear()} Government of Gujarat. All rights reserved.</p>
          <p className="mt-2">Built with N+1 and teams for the citizens of Gujarat</p>
        </div>
      </div>
    </footer>;
}