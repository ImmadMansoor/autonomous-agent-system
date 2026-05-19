'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, ArrowUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItemCard } from './MenuItemCard';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, FONT_SIZES, SHADOWS } from '@/lib/constants';
import { REVEAL_UP, STAGGER_CONTAINER, BUTTON_ANIMATION } from '@/lib/animations';
import { MenuItem, FilterType, SortType } from '@/hooks/useInventoryData';

interface DynamicMenuConsoleProps {
  menuItems: MenuItem[];
  onToggleManagement: (id: string) => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function DynamicMenuConsole({ 
  menuItems, 
  onToggleManagement,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
}: DynamicMenuConsoleProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: 'All Items' },
    { value: 'DYNAMIC', label: 'Dynamic' },
    { value: 'FIXED', label: 'Fixed' },
    { value: 'WASTE_RISK', label: 'Waste Risk' },
  ];

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'status', label: 'Status' },
  ];

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: SPACING.LG , marginTop:"48px"}}>
      <motion.div
        variants={REVEAL_UP}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: SPACING.MD,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{
            fontFamily: TYPOGRAPHY.FONT_HEADLINE,
            fontSize: '32px',
            fontWeight: 700,
            color: COLORS.ON_SURFACE,
            letterSpacing: '-0.02em',
          }}>
            Dynamic Menu Console
          </h2>
          <p style={{
            fontFamily: TYPOGRAPHY.FONT_BODY,
            fontSize: '16px',
            color: COLORS.ON_SURFACE_VARIANT,
            marginTop:"8px"
          }}>
            Manage real-time pricing and AI status across all categories.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: SPACING.SM, alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search 
              size={18} 
              color={COLORS.ON_SURFACE_VARIANT}
              style={{ position: 'absolute', left: '12px' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              style={{
                padding: `${SPACING.SM} ${SPACING.MD}`,
                paddingLeft: '40px',
                background: COLORS.SURFACE_CONTAINER_HIGH,
                border: 'none',
                borderRadius: RADIUS.FULL,
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: FONT_SIZES.LABEL_MD,
                color: COLORS.ON_SURFACE,
                outline: 'none',
                width: '200px',
              }}
            />
          </div>
          
          {/* Filter Dropdown */}
          <div style={{ position: 'relative' }} ref={filterRef}>
            <motion.button
              {...BUTTON_ANIMATION}
              onClick={() => setFilterOpen(!filterOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.XS,
                padding: `${SPACING.SM} ${SPACING.MD}`,
                background: filter !== 'ALL' ? COLORS.PRIMARY + '20' : COLORS.SURFACE_CONTAINER_HIGH,
                borderRadius: RADIUS.FULL,
                border: 'none',
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: FONT_SIZES.LABEL_MD,
                color: filter !== 'ALL' ? COLORS.PRIMARY : COLORS.ON_SURFACE,
                cursor: 'pointer',
              }}
            >
              <Filter size={18} />
              {filter === 'ALL' ? 'Filter' : filter.replace('_', ' ')}
            </motion.button>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: SPACING.SM,
                  background: COLORS.SURFACE_CONTAINER_LOWEST,
                  border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
                  borderRadius: RADIUS.LG,
                  padding: SPACING.SM,
                  boxShadow: SHADOWS.ELEVATED,
                  zIndex: 100,
                  minWidth: '140px',
                }}
              >
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFilterChange(option.value);
                      setFilterOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: `${SPACING.SM} ${SPACING.MD}`,
                      background: filter === option.value ? COLORS.PRIMARY + '10' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: FONT_SIZES.BODY_SM,
                      color: filter === option.value ? COLORS.PRIMARY : COLORS.ON_SURFACE,
                      borderRadius: RADIUS.MD,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          
          {/* Sort Dropdown */}
          <div style={{ position: 'relative' }} ref={sortRef}>
            <motion.button
              {...BUTTON_ANIMATION}
              onClick={() => setSortOpen(!sortOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.XS,
                padding: `${SPACING.SM} ${SPACING.MD}`,
                background: COLORS.SURFACE_CONTAINER_HIGH,
                borderRadius: RADIUS.FULL,
                border: 'none',
                fontFamily: TYPOGRAPHY.FONT_LABEL,
                fontSize: FONT_SIZES.LABEL_MD,
                color: COLORS.ON_SURFACE,
                cursor: 'pointer',
              }}
            >
              <ArrowUpDown size={18} />
              Sort
            </motion.button>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: SPACING.SM,
                  background: COLORS.SURFACE_CONTAINER_LOWEST,
                  border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
                  borderRadius: RADIUS.LG,
                  padding: SPACING.SM,
                  boxShadow: SHADOWS.ELEVATED,
                  zIndex: 100,
                  minWidth: '140px',
                }}
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setSortOpen(false);
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: `${SPACING.SM} ${SPACING.MD}`,
                      background: sortBy === option.value ? COLORS.PRIMARY + '10' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: FONT_SIZES.BODY_SM,
                      color: sortBy === option.value ? COLORS.PRIMARY : COLORS.ON_SURFACE,
                      borderRadius: RADIUS.MD,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Menu Items Grid */}
      <motion.div
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: SPACING.GUTTER,
        }}
      >
        {menuItems.map((item) => (
          <MenuItemCard 
            key={item.id}
            {...item}
            onToggleManagement={() => onToggleManagement(item.id)}
          />
        ))}
      </motion.div>

      {/* Empty State */}
      {menuItems.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '64px',
          color: COLORS.ON_SURFACE_VARIANT,
        }}>
          <p style={{ fontSize: FONT_SIZES.BODY_MD }}>No products found</p>
          <p style={{ fontSize: FONT_SIZES.BODY_SM, marginTop: SPACING.SM }}>Try adjusting your search or filters</p>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: SPACING.MD,
          paddingTop: SPACING.MD,
        }}>
          <span style={{
            fontFamily: TYPOGRAPHY.FONT_LABEL,
            fontSize: FONT_SIZES.LABEL_MD,
            color: COLORS.ON_SURFACE_VARIANT,
          }}>
            Showing {Number((currentPage - 1) * 8) + 1}-{Math.min(Number(currentPage * 8), totalItems)} of {totalItems}
          </span>
          
          <div style={{ display: 'flex', gap: SPACING.XS }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: currentPage === 1 ? COLORS.SURFACE_CONTAINER_HIGH : COLORS.SURFACE_CONTAINER_LOWEST,
                border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
                borderRadius: RADIUS.LG,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={20} color={COLORS.ON_SURFACE} />
            </motion.button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(page)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '36px',
                  height: '36px',
                  padding: `0 ${SPACING.SM}`,
                  background: currentPage === page ? COLORS.PRIMARY : COLORS.SURFACE_CONTAINER_LOWEST,
                  border: `1px solid ${currentPage === page ? COLORS.PRIMARY : COLORS.OUTLINE_VARIANT}`,
                  borderRadius: RADIUS.LG,
                  cursor: 'pointer',
                  fontFamily: TYPOGRAPHY.FONT_LABEL,
                  fontSize: FONT_SIZES.LABEL_MD,
                  color: currentPage === page ? COLORS.ON_PRIMARY : COLORS.ON_SURFACE,
                }}
              >
                {page}
              </motion.button>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: currentPage === totalPages ? COLORS.SURFACE_CONTAINER_HIGH : COLORS.SURFACE_CONTAINER_LOWEST,
                border: `1px solid ${COLORS.OUTLINE_VARIANT}`,
                borderRadius: RADIUS.LG,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={20} color={COLORS.ON_SURFACE} />
            </motion.button>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @media (max-width: 1024px) {
          .menu-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .menu-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}