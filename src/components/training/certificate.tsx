
import { forwardRef } from 'react';
import { ShieldCheck, Award } from 'lucide-react';

interface CertificateTemplateProps {
  userName: string;
  courseName: string;
  completionDate: string;
  expiryDate: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ userName, courseName, completionDate, expiryDate }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[1000px] h-[700px] bg-background text-foreground p-8"
        // Use a generic serif font for a classic, professional look
        style={{ fontFamily: 'serif' }}
      >
        {/* Ornate border simulation */}
        <div className="w-full h-full border-2 border-muted-foreground p-2">
          <div className="w-full h-full border border-muted-foreground/50 p-6 flex flex-col text-center">
            
            {/* Header */}
            <div className="flex justify-center items-center gap-2 mb-6">
                <ShieldCheck className="w-10 h-10 text-primary" />
                <h1 className="text-3xl font-bold tracking-wider" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                CyberGuard
                </h1>
            </div>

            <div className="flex-grow flex flex-col justify-center items-center">
              <p className="text-xl text-muted-foreground">This certificate is hereby awarded to</p>
              
              <p className="text-6xl font-bold my-4 text-primary">{userName}</p>
              
              <p className="text-xl text-muted-foreground">for the successful completion of the course</p>
              
              <h2 className="text-3xl font-semibold mt-4" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                {courseName}
              </h2>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end mt-16 w-full">
              {/* Left Date */}
              <div className="text-center w-1/3">
                <p className="font-mono text-lg border-b-2 border-foreground pb-1">{completionDate}</p>
                <p className="text-xs text-muted-foreground pt-1 tracking-widest">ISSUED ON</p>
              </div>

              {/* Seal */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-primary rounded-full"></div>
                <div className="absolute inset-2 border-2 border-primary/50 rounded-full"></div>
                <Award className="w-16 h-16 text-primary" />
              </div>

              {/* Right Date */}
              <div className="text-center w-1/3">
                <p className="font-mono text-lg border-b-2 border-foreground pb-1">{expiryDate}</p>
                <p className="text-xs text-muted-foreground pt-1 tracking-widest">VALID UNTIL</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
